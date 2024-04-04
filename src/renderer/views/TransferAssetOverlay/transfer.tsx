import {
  Button,
  Container,
  FormControl,
  FormControlLabel,
  InputAdornment,
  OutlinedInput,
  styled,
  Typography,
  CircularProgress as OriginCircularProgress,
  MenuItem,
  Select,
} from "@material-ui/core";
import { T } from "@transifex/react";
import Decimal from "decimal.js";
import { ipcRenderer } from "electron";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { verify as addressVerify } from "src/utils/eip55";
import FailureDialog from "src/renderer/components/FailureDialog/FailureDialog";
import SendingDialog from "src/renderer/components/SendingDialog/SendingDialog";
import SuccessDialog from "src/renderer/components/SuccessDialog/SuccessDialog";
import { TransactionConfirmationListener } from "src/stores/transfer";
import { useStore } from "src/utils/useStore";
import { handleDetailView, TransferPhase } from "src/utils/transfer/utils";
import { useLoginSession } from "src/utils/useLoginSession";

const transifexTags = "Transfer/Transfer";

const TransferContainer = styled(Container)({
  flex: "3",
});

const TransferTitle = styled(Typography)({
  fontFamily: "Montserrat",
  fontSize: "18px",
  color: "#dddddd",
  fontWeight: "bold",
});

const TransferSecondTitle = styled(Typography)({
  fontFamily: "Montserrat",
  fontSize: "14px",
  color: "#dddddd",
});

const TransferInput = styled(OutlinedInput)({
  marginTop: "5px",
  marginBottom: "10px",
  height: "40px",
});

const TransferButton = styled(Button)({
  width: "303px",
  height: "60px",
  fontFamily: "Montserrat",
  fontSize: "18px",
  fontWeight: "bold",
  textTransform: "none",
  margin: "10px",
  borderRadius: "2px",
  position: "relative",
  left: "100px",
});

const CircularProgress = styled(OriginCircularProgress)({
  marginRight: "1em",
});

const SelectWrapper = styled(Select)({
  textTransform: "capitalize",
  height: "40px",
  marginTop: "5px",
  marginBottom: "10px",
});

const Option = styled(MenuItem)({
  textTransform: "capitalize",
});

function TransferPage() {
  const { transfer, planetary } = useStore();
  const [targetPlanet, setTargetPlanet] = useState<string>(planetary.planet.id);
  const [isInterplanetary, setIsInterplanetary] = useState<boolean>(false);
  const privateKey = useLoginSession()?.privateKey;
  const [recipient, setRecipient] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [amount, setAmount] = useState<Decimal>(new Decimal(0));
  const [debounce, setDebounce] = useState<boolean>(false);
  const [recipientWarning, setRecipientWarning] = useState<boolean>(false);
  const [amountWarning, setAmountWarning] = useState<boolean>(false);
  const [memoWarning, setMemoWarning] = useState<boolean>(false);
  const [tx, setTx] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<TransferPhase>(
    TransferPhase.READY,
  );

  useEffect(
    () => setIsInterplanetary(targetPlanet !== planetary.planet.id),
    [targetPlanet],
  );

  const listener: TransactionConfirmationListener = {
    onSuccess: (blockIndex, blockHash) => {
      console.log(`Block #${blockIndex} (${blockHash})`);
      setCurrentPhase(TransferPhase.FINISHED);
      setSuccess(true);
    },
    onFailure: (blockIndex, blockHash) => {
      console.log(`Failed`);
      setCurrentPhase(TransferPhase.FINISHED);
      setSuccess(false);
    },
    onTimeout: (blockIndex, blockHash) => {
      console.log(`Timeout`);
      setCurrentPhase(TransferPhase.FINISHED);
      setSuccess(false);
    },
  };
  const handleButton = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!addressVerify(recipient, true) || !amount.gt(0)) {
      return;
    }

    let finalRecipient = recipient;
    let finalMemo = memo;

    if (isInterplanetary) {
      console.log("Detected Interplanetary Transfer");
      const bridgePair = planetary
        .getBridgePair()
        .find((v) => v.planetId === targetPlanet);
      const bridgeAddress = bridgePair?.bridgeAddress;
      if (bridgeAddress !== undefined) {
        finalMemo = recipient;
        finalRecipient = bridgeAddress;
        console.log(
          `Bridge Matching Success, Recipient: ${finalRecipient}(${bridgePair?.name}), Memo: ${finalMemo}`,
        );
      }
    }

    if (finalRecipient === transfer.loginSession.address.toString()) {
      const errorMessage = "You can't transfer NCG to yourself.";
      alert(errorMessage);
      return;
    }

    if (!privateKey) {
      return;
    }

    setCurrentPhase(TransferPhase.SENDTX);

    setDebounce(true);
    setTimeout(() => {
      setDebounce(false);
    }, 15000);

    const tx = await transfer.transferAsset(finalRecipient, amount, finalMemo);
    setTx(tx);

    setCurrentPhase(TransferPhase.SENDING);

    await transfer.confirmTransaction(tx, undefined, listener);
    event.preventDefault();
  };
  const loading =
    currentPhase === TransferPhase.SENDTX ||
    currentPhase === TransferPhase.SENDING;

  const disabled =
    amountWarning || recipientWarning || memoWarning || loading || debounce;

  return (
    <TransferContainer>
      {planetary.getBridgePair().length > 0 && (
        <>
          <TransferTitle>
            <T _str="Target Planet" _tags={transifexTags} />
          </TransferTitle>
          <TransferSecondTitle>
            <T _str="Select target planet to transfer." _tags={transifexTags} />
          </TransferSecondTitle>
          <FormControl variant="outlined" fullWidth>
            <SelectWrapper
              name="planet"
              onChange={(e) => setTargetPlanet(e.target.value as string)}
              value={targetPlanet}
              inputProps={{ "aria-label": "Without label" }}
            >
              <Option key={planetary.planet.id} value={planetary.planet.id}>
                {planetary.planet.name}
              </Option>
              {planetary.getBridgePair().map((v) => {
                return (
                  <Option key={v.planetId} value={v.planetId}>
                    {v.name}
                  </Option>
                );
              })}
            </SelectWrapper>
          </FormControl>
        </>
      )}
      <TransferTitle>
        <T _str="User Address" _tags={transifexTags} />
      </TransferTitle>

      {isInterplanetary ? (
        <>
          <TransferSecondTitle>
            <T
              _str="You're attempting an interplanetary transfer."
              _tags={transifexTags}
            />
          </TransferSecondTitle>
          <TransferSecondTitle>
            <b style={{ color: "#ff5555" }}>
              <T
                _str="Make sure your recipient NCG address exists in target planet."
                _tags={transifexTags}
              />
            </b>
          </TransferSecondTitle>
        </>
      ) : (
        <TransferSecondTitle>
          <T
            _str="Enter the Nine Chronicle user address. "
            _tags={transifexTags}
          />
          <b style={{ color: "#ff5555" }}>
            <T _str="Not the ETH address." _tags={transifexTags} />
          </b>
        </TransferSecondTitle>
      )}
      <FormControl fullWidth>
        <TransferInput
          type="text"
          name="address"
          error={recipientWarning}
          onChange={(e) => setRecipient(e.target.value)}
          onBlur={() => setRecipientWarning(!addressVerify(recipient, true))}
          onFocus={() => setRecipientWarning(false)}
        />
      </FormControl>
      <TransferTitle>
        <T _str="NCG Amount" _tags={transifexTags} />
      </TransferTitle>
      <TransferSecondTitle>
        <T _str="Enter the amount of NCG to send." _tags={transifexTags} />
        &nbsp;
        <b>
          <T
            _str="(Your balance: {ncg} NCG)"
            _tags={transifexTags}
            ncg={transfer.balance}
          />
        </b>
      </TransferSecondTitle>
      <FormControl fullWidth>
        <TransferInput
          type="number"
          name="amount"
          onChange={(e) =>
            setAmount(new Decimal(e.target.value === "" ? -1 : e.target.value))
          }
          onBlur={() =>
            setAmountWarning(amount.lt(0) || amount.gt(transfer.balance))
          }
          onFocus={() => setAmountWarning(false)}
          error={amountWarning}
          endAdornment={<InputAdornment position="end">NCG</InputAdornment>}
          defaultValue={0}
        />
      </FormControl>
      {!isInterplanetary && (
        <FormControl fullWidth>
          <TransferTitle>
            <T _str="Memo" _tags={transifexTags} />
          </TransferTitle>
          <TransferSecondTitle>
            <T _str="Enter an additional note." _tags={transifexTags} />
            &nbsp;
            <b>{`(${memo.length}/80)`}</b>
          </TransferSecondTitle>
          <TransferInput
            type="text"
            name="memo"
            onBlur={() => setMemoWarning(memo.length > 80)}
            onFocus={() => setAmountWarning(false)}
            error={memoWarning}
            onChange={(e) => setMemo(e.target.value)}
          />
        </FormControl>
      )}
      <FormControl fullWidth>
        <TransferButton
          variant="contained"
          color="primary"
          onClick={handleButton}
          disabled={disabled}
        >
          {loading || debounce ? <CircularProgress /> : "Send"}
        </TransferButton>
      </FormControl>

      <SendingDialog
        open={currentPhase === TransferPhase.SENDING}
        onDetailedView={() => handleDetailView(tx)}
      />

      <SuccessDialog
        open={currentPhase === TransferPhase.FINISHED && success}
        onDetailedView={() => handleDetailView(tx)}
        onClose={() => {
          setCurrentPhase(TransferPhase.READY);
          setSuccess(false);
        }}
      >
        <T _str="Send Success!" _tags={transifexTags} />
      </SuccessDialog>

      <FailureDialog
        open={currentPhase === TransferPhase.FINISHED && !success}
        onDetailedView={() => handleDetailView(tx)}
        onClose={() => {
          setCurrentPhase(TransferPhase.READY);
          setSuccess(false);
        }}
      />
    </TransferContainer>
  );
}

export default observer(TransferPage);

import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  Icon,
  InputAdornment,
  OutlinedInput,
  styled,
  Typography,
} from "@material-ui/core";
import { T } from "@transifex/react";
import Decimal from "decimal.js";
import { ipcRenderer } from "electron";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { verify as addressVerify } from "eip55";
import FailureDialog from "src/renderer/components/FailureDialog/FailureDialog";
import SendingDialog from "src/renderer/components/SendingDialog/SendingDialog";
import SuccessDialog from "src/renderer/components/SuccessDialog/SuccessDialog";
import { useStore } from "src/utils/useStore";
import { TransactionConfirmationListener } from "src/stores/transfer";
import { handleDetailView, TransferPhase } from "src/utils/transfer/utils";
import { useLoginSession } from "src/utils/useLoginSession";
import { Refresh, ArrowForward } from "@material-ui/icons";
import { BRIDGE_MIN, BRIDGE_MAX, NCGtoWNCG } from "src/utils/bridgeFee";

const transifexTags = "Transfer/Transfer";

const SwapContainer = styled(Container)({
  flex: "3",
  flexDirection: "column",
});

const SwapTitle = styled(Typography)({
  fontSize: "18px",
  color: "#dddddd",
  fontWeight: "bold",
});

const SwapSecondTitle = styled(Typography)({
  fontSize: "14px",
  color: "#dddddd",
});

const SwapNoticeTitle = styled(Typography)({
  fontWeight: "bold",
  marginTop: "10px",
  fontSize: "16px",
  color: "#979797",
});

const SwapNoticeLabel = styled(Typography)({
  fontSize: "14px",
  color: "#979797",
});

const SwapInput = styled(OutlinedInput)({
  marginTop: "5px",
  marginBottom: "5px",
  height: "40px",
});

const SwapButton = styled(Button)({
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

function SwapPage() {
  const transfer = useStore("transfer");
  const loginSession = useLoginSession();
  const [recipient, setRecipient] = useState<string>("");
  const [tempAmount, setTempAmount] = useState("100");
  const [amount, setAmount] = useState<Decimal>(new Decimal(100));
  const [WNCGAmount, setWNCGAmount] = useState<Decimal>(new Decimal(90));
  const [recipientWarning, setRecipientWarning] = useState<boolean>(false);
  const [amountWarning, setAmountWarning] = useState<boolean>(false);
  const [tx, setTx] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [debounce, setDebounce] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<TransferPhase>(
    TransferPhase.READY,
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

  const isOutOfRange = amount.lt(BRIDGE_MIN) || amount.gt(BRIDGE_MAX);

  useEffect(() => {
    setAmountWarning(isOutOfRange || amount.gt(transfer.balance));
    setWNCGAmount(NCGtoWNCG(amount));
  }, [amount]);

  const handleButton = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDebounce(true);
    setTimeout(() => {
      setDebounce(false);
    }, 15000);

    ipcRenderer.send("mixpanel-track-event", "Launcher/Swap WNCG");
    if (!addressVerify(recipient, true) || isOutOfRange) {
      return;
    }

    if (!loginSession) {
      return;
    }
    setCurrentPhase(TransferPhase.SENDTX);

    const tx = await transfer.swapToWNCG(
      transfer.senderAddress,
      recipient,
      amount,
      loginSession.privateKey,
    );
    setTx(tx);

    setCurrentPhase(TransferPhase.SENDING);

    await transfer.confirmTransaction(tx, undefined, listener);
  };

  const loading =
    currentPhase === TransferPhase.SENDTX ||
    currentPhase === TransferPhase.SENDING;

  return (
    <SwapContainer>
      <SwapTitle>
        <T _str="ETH Address" _tags={transifexTags} />
      </SwapTitle>
      <SwapSecondTitle>
        <T _str="Enter the ETH Address." _tags={transifexTags} />
      </SwapSecondTitle>

      <FormControl fullWidth>
        <SwapInput
          type="text"
          name="address"
          error={recipientWarning}
          onChange={(e) => setRecipient(e.target.value)}
          onBlur={() => setRecipientWarning(!addressVerify(recipient, true))}
          onFocus={() => setRecipientWarning(false)}
        />
      </FormControl>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <SwapTitle>
            <T _str="Send Amount" _tags={transifexTags} />
          </SwapTitle>
          <SwapSecondTitle>
            <T _str="Amount of NCG to send." _tags={transifexTags} />
          </SwapSecondTitle>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="end">
          <SwapTitle>
            <T _str="Recieve Amount" _tags={transifexTags} />
          </SwapTitle>
          <SwapSecondTitle>
            <T _str="Amount of WNCG to be recieved" _tags={transifexTags} />
          </SwapSecondTitle>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <FormControl style={{ flexBasis: "240px" }}>
          <SwapInput
            type="number"
            name="amount"
            onChange={(e) => {
              const inputValue = e.target.value;
              setTempAmount(inputValue === "" ? "" : inputValue);
              try {
                setAmount(
                  new Decimal(
                    inputValue === "" ? "100" : inputValue,
                  ).toDecimalPlaces(2),
                );
              } catch (error) {
                console.error("Invalid decimal value:", error);
              }
            }}
            onBlur={() => setTempAmount(amount.toFixed(2))}
            error={amountWarning}
            endAdornment={<InputAdornment position="end">NCG</InputAdornment>}
            defaultValue={100}
            value={tempAmount}
          />
        </FormControl>
        <Icon component={ArrowForward} />
        <FormControl style={{ flexBasis: "240px" }}>
          <SwapInput
            disabled
            type="number"
            name="amount"
            error={amountWarning}
            endAdornment={<InputAdornment position="end">WNCG</InputAdornment>}
            value={isOutOfRange ? "" : WNCGAmount.toFixed(2)}
          />
        </FormControl>
      </Box>
      <b>
        <T
          _str="(Balance: {ncg} NCG)"
          _tags={transifexTags}
          ncg={transfer.balance}
        />
      </b>
      <IconButton
        size="small"
        onClick={() => transfer.updateBalance(transfer.senderAddress)}
      >
        <Refresh />
      </IconButton>
      <ul style={{ listStyleType: "none", padding: 0, marginTop: "5px" }}>
        <li>
          <SwapSecondTitle>Bridge Transfer Limit</SwapSecondTitle>
          <SwapNoticeLabel>
            <T _str="ᐧ Minimum 100 NCG per transfer" _tags={transifexTags} />
          </SwapNoticeLabel>
        </li>
        <li>
          <SwapNoticeLabel>
            <T
              _str="ᐧ Maximum {max, number, integer} NCG per day"
              _tags={transifexTags}
              max={BRIDGE_MAX}
            />
          </SwapNoticeLabel>
        </li>
        <SwapSecondTitle>Bridge Fee</SwapSecondTitle>
        <li>
          <SwapNoticeLabel>
            <T _str="ᐧ <1,000 NCG: 10 NCG fixed" _tags={transifexTags} />
          </SwapNoticeLabel>
        </li>
        <li>
          <SwapNoticeLabel>
            <T
              _str="ᐧ ≥1,000 NCG : 1% base fee on total amount, 2% additional surcharge for amount exceeding 10,000 NCG."
              _tags={transifexTags}
            />
          </SwapNoticeLabel>
        </li>
      </ul>
      <SwapButton
        variant="contained"
        color="primary"
        onClick={handleButton}
        disabled={amountWarning || recipientWarning}
      >
        {loading || debounce ? <CircularProgress /> : "Send"}
      </SwapButton>

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
        <T
          _str="Although the NCG remittance was successful, the WNCG conversion takes about 20 minutes."
          _tags={transifexTags}
        />
      </SuccessDialog>

      <FailureDialog
        open={currentPhase === TransferPhase.FINISHED && !success}
        onDetailedView={() => handleDetailView(tx)}
        onClose={() => {
          setCurrentPhase(TransferPhase.READY);
          setSuccess(false);
        }}
      />
    </SwapContainer>
  );
}

export default observer(SwapPage);

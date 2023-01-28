import {
  Button,
  Container,
  FormControl,
  InputAdornment,
  OutlinedInput,
  styled,
  Typography,
} from "@material-ui/core";
import { T } from "@transifex/react";
import Decimal from "decimal.js";
import { ipcRenderer } from "electron";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { verify as addressVerify } from "eip55";
import FailureDialog from "src/renderer/components/FailureDialog/FailureDialog";
import SendingDialog from "src/renderer/components/SendingDialog/SendingDialog";
import SuccessDialog from "src/renderer/components/SuccessDialog/SuccessDialog";
import { useStore } from "src/utils/useStore";
import { TransactionConfirmationListener } from "src/stores/transfer";
import { handleDetailView, TransferPhase } from "src/utils/transfer/utils";
import refreshIcon from "src/renderer/resources/refreshIcon.png";
import { useLoginSession } from "src/utils/useLoginSession";

const transifexTags = "Transfer/Transfer";

const SwapContainer = styled(Container)({
  flex: "3",
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
  marginBottom: "10px",
  height: "50px",
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
  const { publicKey, account } = useLoginSession();
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<Decimal>(new Decimal(0));
  const [recipientWarning, setRecipientWarning] = useState<boolean>(false);
  const [amountWarning, setAmountWarning] = useState<boolean>(false);
  const [tx, setTx] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<TransferPhase>(
    TransferPhase.READY
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
    event.preventDefault();
    ipcRenderer.send("mixpanel-track-event", "Launcher/Swap WNCG");
    if (!addressVerify(recipient) || !amount.gt(0)) {
      return;
    }

    if (!publicKey || !account) {
      return;
    }

    setCurrentPhase(TransferPhase.SENDTX);

    const tx = await transfer.swapToWNCG(
      transfer.senderAddress,
      recipient,
      amount,
      publicKey,
      account
    );
    setTx(tx);

    setCurrentPhase(TransferPhase.SENDING);

    await transfer.confirmTransaction(tx, undefined, listener);
  };

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
      <SwapTitle>
        <T _str="NCG Amount" _tags={transifexTags} />
      </SwapTitle>
      <SwapSecondTitle>
        <T _str="Enter the amount of NCG to send." _tags={transifexTags} />
        &nbsp;
        <b>
          <T
            _str="(Your balance: {ncg} NCG)"
            _tags={transifexTags}
            ncg={transfer.balance}
          />
        </b>
        <Button
          startIcon={<img src={refreshIcon} alt="refresh" />}
          onClick={() => transfer.updateBalance(transfer.senderAddress)}
        />
      </SwapSecondTitle>
      <FormControl fullWidth>
        <SwapInput
          type="number"
          name="amount"
          onChange={(e) =>
            setAmount(new Decimal(e.target.value === "" ? -1 : e.target.value))
          }
          onBlur={() => setAmountWarning(!amount.gt(0))}
          onFocus={() => setAmountWarning(false)}
          error={amountWarning}
          endAdornment={<InputAdornment position="end">NCG</InputAdornment>}
          defaultValue={0}
        />
      </FormControl>
      <SwapNoticeTitle>
        <T _str="Notice" _tags={transifexTags} />
      </SwapNoticeTitle>
      <ul style={{ listStyleType: "none", padding: 0, marginTop: "5px" }}>
        <li>
          <SwapNoticeLabel>
            <T _str="* Minimum 100 NCG per transfer" _tags={transifexTags} />
          </SwapNoticeLabel>
        </li>
        <li>
          <SwapNoticeLabel>
            <T
              _str="* Maximum {max, number, integer} NCG per day"
              _tags={transifexTags}
              max={5000}
            />
          </SwapNoticeLabel>
        </li>
        <li>
          <SwapNoticeLabel>
            <T
              _str="* 1% fee deducted to operate bridge (ETH gas fee & development cost)"
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
        {" "}
        Send{" "}
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

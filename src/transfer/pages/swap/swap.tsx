import { Button, Container, FormControl, InputAdornment, OutlinedInput, styled, TextField, Typography } from "@material-ui/core";
import { T } from "@transifex/react";
import Decimal from "decimal.js";
import { observer } from "mobx-react";
import React, { useContext } from "react"
import FailureDialog from "src/transfer/components/FailureDialog/FailureDialog";
import SendingDialog from "src/transfer/components/SendingDialog/SendingDialog";
import SuccessDialog from "src/transfer/components/SuccessDialog/SuccessDialog";
import { StoreContext } from "src/transfer/hooks";
import { TransactionConfirmationListener } from "src/transfer/stores/headless";
import { TransferPhase } from "src/transfer/stores/views/transfer";
import refreshIcon from "../../resources/refreshIcon.png";

const transifexTags = "Transfer/Transfer";

export type Props = {
  onDetailedView: (tx: string) => void;
};

const SwapContainer = styled(Container)({
  flex: '3',
});

const SwapTitle = styled(Typography)({
  fontSize: '18px',
  color: '#dddddd',
  fontWeight: 'bold',
});

const SwapSecondTitle = styled(Typography)({
  fontSize: '14px',
  color: '#dddddd',
});

const SwapNoticeTitle = styled(Typography)({
  fontWeight: 'bold',
  marginTop: '10px',
  fontSize: '16px',
  color: '#979797',
});

const SwapNoticeLabel = styled(Typography)({
  fontSize: '14px',
  color: '#979797',
});

const SwapInput = styled(OutlinedInput)({
  marginTop: '5px',
  marginBottom: '10px',
  height: '50px'
});

const SwapButton = styled(Button)({
  width: '303px',
  height: '60px',
  fontFamily: 'Montserrat',
  fontSize: '18px',
  fontWeight: 'bold',
  textTransform: 'none',
  margin: '10px',
  borderRadius: '2px',
  position: 'relative',
  left: '100px',
});

const SwapPage: React.FC<Props> = observer((props: Props) => {
  const { headlessStore, swapPage } = useContext(StoreContext);
  const { onDetailedView } = props;

  const listener: TransactionConfirmationListener = {
    onSuccess: (blockIndex, blockHash) => {
      console.log(`Block #${blockIndex} (${blockHash})`);
      swapPage.endSend(true);
    },
    onFailure: (blockIndex, blockHash) => {
      console.log(`Failed`);
      swapPage.endSend(false);
    },
    onTimeout: (blockIndex, blockHash) => {
      console.log(`Timeout`);
      swapPage.endSend(false);
    }
  }

  const handleButton = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!swapPage.validateRecipient || !swapPage.validateAmount) {
      return;
    }
    swapPage.startSend();
    const { recipient, amount } = swapPage;
    const tx = await headlessStore.swapToWNCG(recipient, amount);
    swapPage.setTx(tx);

    headlessStore.confirmTransaction(tx, undefined, listener);
  }

  return (
    <SwapContainer>
      <FormControl fullWidth>
        <SwapTitle>
          <T _str="ETH Address" _tags={transifexTags} />
        </SwapTitle>
        <SwapSecondTitle>
          <T _str="Enter the ETH Address." _tags={transifexTags} />
        </SwapSecondTitle>
        <SwapInput
          type="text"
          name="address"
          error={swapPage.recipientWarning}
          onChange={e => swapPage.setRecipient(e.target.value)}
          onBlur={() => swapPage.setRecipientWarning()}
          onFocus={() => swapPage.resetRecipientWarning()}
        />
        <SwapTitle>
          <T _str="NCG Amount" _tags={transifexTags} />
        </SwapTitle>
        <SwapSecondTitle>
          <T _str="Enter the amount of NCG to send." _tags={transifexTags} />&nbsp;
          <b>
            <T _str="(Your balance: {ncg} NCG)" _tags={transifexTags} ncg={headlessStore.balance} />
          </b>
          <Button
            startIcon={<img src={refreshIcon} alt="refresh" />}
            onClick={() => headlessStore.updateBalance()}
          />
        </SwapSecondTitle>
        <SwapInput
          type="number"
          name="amount"
          onChange={e => swapPage.setAmount(new Decimal(e.target.value === '' ? -1 : e.target.value))}
          onBlur={() => swapPage.setAmountWarning()}
          onFocus={() => swapPage.resetAmountWarning()}
          error={swapPage.amountWarning}
          endAdornment={
            <InputAdornment position="end">NCG</InputAdornment>
          }
          defaultValue={0}
        />
        <SwapNoticeTitle>
          <T _str="Notice" _tags={transifexTags} />
        </SwapNoticeTitle>
        <ul style={{ listStyleType: "none", padding: 0, marginTop: '5px' }}>
          <li>
            <SwapNoticeLabel>
              <T _str="* Minimum 100 NCG per transfer" _tags={transifexTags} />
            </SwapNoticeLabel>
          </li>
          <li>
            <SwapNoticeLabel>
              <T _str="* Maximum 100,000 NCG per day" _tags={transifexTags} />
            </SwapNoticeLabel>
          </li>
          <li>
            <SwapNoticeLabel>
              <T _str="* 1% fee deducted to operate bridge (ETH gas fee & development cost)" _tags={transifexTags} />
            </SwapNoticeLabel>
          </li>
        </ul>
        <SwapButton
          variant="contained"
          color="primary"
          onClick={handleButton}
          disabled={!swapPage.sendButtonActivated}
        > Send </SwapButton>
      </FormControl>

      <SendingDialog
        open={swapPage.currentPhase === TransferPhase.SENDING}
        onDetailedView={() => onDetailedView(swapPage.tx)}
      />

      <SuccessDialog
        open={swapPage.currentPhase === TransferPhase.FINISHED && swapPage.success}
        onDetailedView={() => onDetailedView(swapPage.tx)}
        onClose={() => swapPage.finish()}
      >
        <T _str="Although the NCG remittance was successful, the WNCG conversion takes about 20 minutes." _tags={transifexTags} />
      </SuccessDialog>

      <FailureDialog
        open={swapPage.currentPhase === TransferPhase.FINISHED && !swapPage.success}
        onDetailedView={() => onDetailedView(swapPage.tx)}
        onClose={() => swapPage.finish()}
      />
    </SwapContainer >
  );
});

export default SwapPage;

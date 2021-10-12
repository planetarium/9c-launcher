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
import { verify as addressVerify } from 'eip55'

const transifexTags = "Transfer/Transfer";

export type Props = {
  onDetailedView: (tx: string) => void;
};

const TransferContainer = styled(Container)({
  flex: '3',
});

const TransferTitle = styled(Typography)({
  fontSize: '18px',
  color: '#dddddd',
  fontWeight: 'bold',
});

const TransferSecondTitle = styled(Typography)({
  fontSize: '14px',
  color: '#dddddd',
});

const TransferInput = styled(OutlinedInput)({
  marginTop: '5px',
  marginBottom: '10px',
  height: '50px'
});

const TransferButton = styled(Button)({
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

const TransferPage: React.FC<Props> = observer((props: Props) => {
  const { headlessStore, transferPage } = useContext(StoreContext);
  const { onDetailedView } = props;

  const listener: TransactionConfirmationListener = {
    onSuccess: (blockIndex, blockHash) => {
      console.log(`Block #${blockIndex} (${blockHash})`);
      transferPage.endSend(true);
    },
    onFailure: (blockIndex, blockHash) => {
      console.log(`Failed`);
      transferPage.endSend(false);
    },
    onTimeout: (blockIndex, blockHash) => {
      console.log(`Timeout`);
      transferPage.endSend(false);
    }
  }

  const handleButton = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if(!transferPage.validateRecipient || !transferPage.validateAmount) {
      return; 
    }
    transferPage.startSend();
    const { recipient, amount, memo } = transferPage;
    const tx = await headlessStore.transferGold(recipient, amount, memo);
    transferPage.setTx(tx);

    headlessStore.confirmTransaction(tx, undefined, listener);
  }

  return (
    <TransferContainer>
      <FormControl fullWidth>
        <TransferTitle>
          <T _str="User Address" _tags={transifexTags} />
        </TransferTitle>
        <TransferSecondTitle>
          <T _str="Enter the Nine Chronicle user address. " _tags={transifexTags} />
          <b style={{color: "#ff5555"}}>
            <T _str="Not the ETH address." _tags={transifexTags} />
          </b>
        </TransferSecondTitle>
        <TransferInput
          type="text"
          name="address"
          error={transferPage.recipientWarning}
          onChange={e => transferPage.setRecipient(e.target.value)}
          onBlur={() => transferPage.setRecipientWarning()}
          onFocus={() => transferPage.resetRecipientWarning()}
        />
        <TransferTitle>
          <T _str="NCG Amount" _tags={transifexTags} />
        </TransferTitle>
        <TransferSecondTitle>
          <T _str="Enter the amount of NCG to send." _tags={transifexTags} />&nbsp;
          <b>
            <T _str="(Your balance: {ncg} NCG)" _tags={transifexTags} ncg={headlessStore.balance} />
          </b>
        <Button
          startIcon={<img src={refreshIcon} alt="refresh" />}
          onClick={() => headlessStore.updateBalance()}
        />
        </TransferSecondTitle>
        <TransferInput
          type="number"
          name="amount"
          onChange={e => transferPage.setAmount(new Decimal(e.target.value === '' ? -1 : e.target.value))}
          onBlur={() => transferPage.setAmountWarning()}
          onFocus={() => transferPage.resetAmountWarning()}
          error={transferPage.amountWarning}
          endAdornment={
            <InputAdornment position="end">NCG</InputAdornment>
          }
          defaultValue={0}
        />
        <TransferTitle>
          <T _str="Memo" _tags={transifexTags} />
        </TransferTitle>
        <TransferSecondTitle>
          <T _str="Enter an additional note." _tags={transifexTags} />
        </TransferSecondTitle>
        <TransferInput
          type="text"
          name="memo"
          onChange={e => transferPage.setMemo(e.target.value)}
        />
        <TransferButton
          variant="contained"
          color="primary"
          onClick={handleButton}
          disabled={!transferPage.sendButtonActivated}
        > Send </TransferButton>
      </FormControl>

      <SendingDialog
        open={transferPage.currentPhase === TransferPhase.SENDING}
        onDetailedView={() => onDetailedView(transferPage.tx)}
      />

      <SuccessDialog
        open={transferPage.currentPhase === TransferPhase.FINISHED && transferPage.success}
        onDetailedView={() => onDetailedView(transferPage.tx)}
        onClose={() => transferPage.finish()}
      >
          <T _str="Send Success!" _tags={transifexTags} />
      </SuccessDialog>

      <FailureDialog
        open={transferPage.currentPhase === TransferPhase.FINISHED && !transferPage.success}
        onDetailedView={() => onDetailedView(transferPage.tx)}
        onClose={() => transferPage.finish()}
      />
    </TransferContainer>
  );
});

export default TransferPage;

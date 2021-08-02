import { Container, OutlinedInput, styled, TextField, Typography } from "@material-ui/core";
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

const TransferTextField = styled(TextField)({
  color: 'white',
  borderColor: 'white',
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
    transferPage.startSend();
    const { recipient, amount, memo } = transferPage;
    const tx = await headlessStore.transferGold(recipient, amount, memo);
    transferPage.setTx(tx);

    headlessStore.confirmTransaction(tx, undefined, listener);
  }

  return (
    <TransferContainer>
      <div>
        <TransferTitle>
          <T _str="User Address" _tags={transifexTags} />
        </TransferTitle>
        <TransferSecondTitle>
          <T _str="Enter the Nine Chronicle user address, not the ETH address." _tags={transifexTags} />
        </TransferSecondTitle>
        <OutlinedInput
          label="Address"
          onChange={e => transferPage.setRecipient(e.target.value)}
        />
      </div>
      <div>
        <h2>
          <T _str="NCG Amount" _tags={transifexTags} />
        </h2>
        <p>
          <T _str="Enter the amount of NCG to send." _tags={transifexTags} />
        </p>
        <p>
          <T _str="(Your balance: {ncg} NCG)" _tags={transifexTags} ncg={headlessStore.balance} />
        </p>
        <button onClick={() => headlessStore.updateBalance()}>refresh</button>
        <input onChange={e => transferPage.setAmount(new Decimal(e.target.value))}></input>
      </div>
      <div>
        <h2>
          <T _str="Memo" _tags={transifexTags} />
        </h2>
        <p>
          <T _str="Enter a additional note." _tags={transifexTags} />
        </p>
        <input onChange={e => transferPage.setMemo(e.target.value)}></input>
      </div>
      <div>
        <button onClick={handleButton} disabled={transferPage.currentPhase !== TransferPhase.READY}>Send</button>
      </div>
      <SendingDialog
        open={transferPage.currentPhase === TransferPhase.SENDING}
        onDetailedView={() => onDetailedView(transferPage.tx)}
      />

      <SuccessDialog
        open={transferPage.currentPhase === TransferPhase.FINISHED && transferPage.success}
        onDetailedView={() => onDetailedView(transferPage.tx)}
        onClose={() => transferPage.finish()}
      />

      <FailureDialog
        open={transferPage.currentPhase === TransferPhase.FINISHED && !transferPage.success}
        onDetailedView={() => onDetailedView(transferPage.tx)}
        onClose={() => transferPage.finish()}
      />
    </TransferContainer>
  );
});

export default TransferPage;

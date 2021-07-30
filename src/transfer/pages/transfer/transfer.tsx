import { T } from "@transifex/react";
import { observer } from "mobx-react";
import React, { useContext } from "react"
import FailureDialog from "src/transfer/components/FailureDialog/FailureDialog";
import SendingDialog from "src/transfer/components/SendingDialog/SendingDialog";
import SuccessDialog from "src/transfer/components/SuccessDialog/SuccessDialog";
import { StoreContext } from "src/transfer/hooks";
import { TransferPhase } from "src/transfer/stores/views/transfer";

const transifexTags = "Transfer/Transfer";

export type Props = {
  onDetailedView: (tx: string) => void;
};


const TransferPage: React.FC<Props> = observer((props: Props) => {
  const { headlessStore, transferPage } = useContext(StoreContext);
  const { onDetailedView } = props;

  const handleButton = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    transferPage.startSend();
    const { recipient, amount, memo } = transferPage;
    const tx = await headlessStore.transferGold(recipient, amount, memo);
    transferPage.setTx(tx);

    headlessStore.confirmTransaction(tx, undefined,
      (blockIndex, blockHash) => {
        console.log(`Block #${blockIndex} (${blockHash})`);
        transferPage.endSend(true);
      },
      (blockIndex, blockHash) => {
        console.log(`Failed`);
        transferPage.endSend(false);
      },
      (blockIndex, blockHash) => {
        console.log(`Timeout`);
        transferPage.endSend(false);
      });
  }

  return (
    <div>
      <div>
        <h2>
          <T _str="User Address" _tags={transifexTags} />
        </h2>
        <p>
          <T _str="This is NOT an ETH address." _tags={transifexTags} />
        </p>
        <p>
          <T _str="Enter the other user's Nine Chronicles address." _tags={transifexTags} />
        </p>
        <input onChange={e => transferPage.setRecipient(e.target.value)}></input>
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
        <input onChange={e => transferPage.setAmount(parseFloat(e.target.value))}></input>
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
    </div>
  );
});

export default TransferPage;

import { T } from "@transifex/react";
import { shell } from "electron";
import { observer } from "mobx-react";
import React, { useContext } from "react"
import { useState } from "react";
import SendingDialog from "src/transfer/components/SendingDialog/SendingDialog";
import { StoreContext } from "src/transfer/hooks";

const transifexTags = "Transfer/Transfer";

const TransferPage: React.FC = observer(() => {
  const { headlessStore } = useContext(StoreContext);
  const [recipient, setRecipient] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [tx, setTx] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleButton = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsSending(true);
    const tx = await headlessStore.transferGold(recipient, amount, memo);
    setTx(tx);

    headlessStore.confirmTransaction(tx, undefined,
      (blockIndex, blockHash) => {
        console.log(`Block #${blockIndex} (${blockHash})`);
        setIsSending(false);
        setTx('');
      },
      (blockIndex, blockHash) => {
        console.log(`Failed`);
        setIsSending(false);
        setTx('');
      },
      (blockIndex, blockHash) => {
        console.log(`Timeout`);
        setIsSending(false);
        setTx('');
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
        <input onChange={e => setRecipient(e.target.value)}></input>
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
        <input onChange={e => setAmount(parseFloat(e.target.value))}></input>
      </div>
      <div>
        <h2>
          <T _str="Memo" _tags={transifexTags} />
        </h2>
        <p>
          <T _str="Enter a additional note." _tags={transifexTags} />
        </p>
        <input onChange={e => setMemo(e.target.value)}></input>
      </div>
      <div>
        <button onClick={handleButton} disabled={isSending}>Send</button>
      </div>
      <SendingDialog
        open={tx !== ''}
        onDetailedView={() => {
          shell.openExternal(
            `https://explorer.libplanet.io/9c-main/transaction/?${tx}`
          );
        }}
      />

    </div>
  );
});

export default TransferPage;

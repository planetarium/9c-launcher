import { T } from "@transifex/react";
import { observer } from "mobx-react";
import React, { useContext } from "react"
import { useState } from "react";
import { StoreContext } from "src/transfer/hooks";

const transifexTags = "Transfer/Transfer";

const TransferPage: React.FC = observer(() => {
  const { transferStore } = useContext(StoreContext);
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [memo, setMemo] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleButton = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsSending(true);
    const tx = await transferStore.transferGold(recipient, amount, memo);

    transferStore.confirmTransaction(tx, undefined, (blockIndex, blockHash) => {
      console.log(`Block #${blockIndex} (${blockHash})`);
      setIsSending(false);
    },
    (blockIndex, blockHash) => {
      console.log(`Failed`);
      setIsSending(false);
    },
    (blockIndex, blockHash) => {
      console.log(`Timeout`);
      setIsSending(false);
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
          <T _str="(Your balance: {ncg} NCG)" _tags={transifexTags} ncg={transferStore.balance}/>
        </p>
        <button onClick={() => transferStore.updateBalance()}>refresh</button>
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
    </div>
  );
});

export default TransferPage;

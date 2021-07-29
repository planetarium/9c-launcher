import { T } from "@transifex/react";
import { observer } from "mobx-react";
import React, { useContext } from "react"
import { StoreContext } from "src/transfer/hooks";
import { MenuItems } from "src/transfer/stores/menu";

const transifexTags = "Transfer/Transfer";

const TransferPage: React.FC = observer(() => {
  const { transferStore } = useContext(StoreContext);

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
        <input></input>
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
        <input></input>
      </div>
      <div>
        <h2>
          <T _str="Memo" _tags={transifexTags} />
        </h2>
        <p>
          <T _str="Enter a additional note." _tags={transifexTags} />
        </p>
        <input></input>
      </div>
      <div>
        <button>Send</button>
      </div>
    </div>
  );
});

export default TransferPage;

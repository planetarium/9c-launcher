import React, { useState } from "react"
import {
  useClaimCollectionRewardMutation,
  useGetNextTxNonceQuery,
  useStageTxV2Mutation,
} from "../../../generated/graphql";
import { Reward } from "../../../collection/types"
import CharSelectDialog from "./CharSelectDialog/CharSelectDialog";
import ReceivedDialog from "./ReceivedDialog/ReceivedDialog";
import {tmpName} from "tmp-promise";
import {ipcRenderer} from "electron";

export type Props = {
  rewards: Reward[]
  avatar: {address: string, name: string, updatedAt: number}[]
  tip: number
  onActionTxId: (txId: string) => void;
  agentAddress: string
}

const ClaimCollectionRewardDialog: React.FC<Props> = (props: Props) => {
  const {rewards, avatar, tip, onActionTxId, agentAddress} = props;
  const [step, setStep] = useState<number>(0);
  const [claim] = useStageTxV2Mutation();

  const { refetch: txNonceRefetch } = useGetNextTxNonceQuery({
    variables: {
      address: agentAddress
    }
  })

  const handleStep = () => setStep(step + 1);
  const handleSubmit = async (address: string) => {
    let tx = "";
    try {
      tx = await makeTx(address);
    }
    catch (e)
    {
      console.log(`failed tx: ${e.message}`);
      return;
    }
    const result = await claim({variables: {
      encodedTx: tx
    }});
    console.log(`result: ${result.data?.stageTxV2}`);
    onActionTxId(result.data?.stageTxV2);
  }

  switch(step) {
    case 0:
      return <ReceivedDialog rewards={rewards} onClick={avatar.length === 1 ? () => handleSubmit(avatar[0].address) : handleStep}/>
    
    case 1:
      return <CharSelectDialog avatar={avatar.sort((x, y) => y.updatedAt - x.updatedAt)} tip={tip} onClick={handleSubmit}/>
    default:
      return <></>
  }

  async function makeTx(avatarAddress: string) {
    console.log(`makeTx: avatarAddress: ${avatarAddress}`)
    // create action.
    const fileName = await tmpName();
    if (avatarAddress.startsWith("0x"))
    {
      avatarAddress = avatarAddress.substr(2);
    }
    let errorMsg;
    if (!ipcRenderer.sendSync("claim-monster-collection-reward", avatarAddress, fileName))
    {
      errorMsg = "makeTx: failed action";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // get tx nonce.
    const ended = async () => {
      return await txNonceRefetch({address: agentAddress});
    }
    let txNonce;
    try {
      let res = await ended();
      txNonce = res.data.transaction.nextTxNonce;
    }
    catch (e) {
      errorMsg = "makeTx: failed tx nonce";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    console.log(`makeTx: nonce: ${txNonce}`)
    // sign tx.
    const result = ipcRenderer.sendSync("sign-tx", txNonce, new Date().toISOString(), fileName);
    if (result.stderr != "")
    {
      errorMsg = `makeTx: error: ${result.stderror}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    if (result.stdout != "")
    {
      console.log(`makeTx: tx: ${result.stdout}`)
      return result.stdout;
    }
    throw new Error("makeTx: failed sign tx with empty result.");
  }
}

export default ClaimCollectionRewardDialog

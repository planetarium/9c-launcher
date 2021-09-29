import React, { useState } from "react"
import {
  useClaimCollectionRewardMutation,
  useGetNextTxNonceQuery,
  useStageTxTxIdMutation,
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
  const [claim] = useStageTxTxIdMutation();

  const { refetch: txNonceRefetch } = useGetNextTxNonceQuery({
    variables: {
      address: agentAddress
    }
  })

  const handleStep = () => setStep(step + 1);
  const handleSubmit = async (address: string) => {
    const tx = await makeTx(address);
    if (tx === "")
    {
      console.log(`failed tx`);
      return;
    }
    const result = await claim({variables: {
      encodedTx: tx
    }});
    console.log(`result: ${result.data?.stageTxTxId}`);
    onActionTxId(result.data?.stageTxTxId);
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
    if (!ipcRenderer.sendSync("claim-monster-collection-reward", avatarAddress, fileName))
    {
      console.error(`makeTx: failed action`)
      return "";
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
      console.error(`makeTx: failed tx nonce`)
      return "";
    }
    console.log(`makeTx: nonce: ${txNonce}`)
    // sign tx.
    const result = ipcRenderer.sendSync("sign-tx", txNonce, new Date().toISOString(), fileName);
    if (result.stderr != "")
    {
      console.error(`makeTx: error: ${result.stderror}`)
      return "";
    }
    if (result.stdout != "")
    {
      console.log(`makeTx: tx: ${result.stdout}`)
      return result.stdout;
    }
    return "";
  }
}

export default ClaimCollectionRewardDialog

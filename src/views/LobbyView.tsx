import * as React from 'react';
import gql from "graphql-tag";
import { useState } from 'react';
import { useSubscription, useQuery } from 'react-apollo';
import { standaloneProperties, RPC_LOOPBACK_HOST } from '../constant';


type PreloadStateType = "BlockHashDownloadState" | "BlockDownloadState" | "BlockVerificationState" | "StateDownloadState" | "ActionExecutionState"

interface PreloadProgressExtra {
    type: PreloadStateType,
    currentCount: number,
    totalCount: number,
}

interface PreloadProgress {
    currentPhase: number,
    totalPhase: number,
    extra: PreloadProgressExtra,
}

interface PreloadProgressSubscriptionResult {
    preloadProgress: PreloadProgress,
}

interface NodeStatus {
    bootstrapEnded: boolean,
    preloadEnded: boolean,
}

interface NodeStatusQueryResult {
    nodeStatus: NodeStatus,
}

const SUBSCRIPTION_PRELOAD_PROGRESS = gql`
    subscription {
        preloadProgress {
            currentPhase
            totalPhase
            extra {
                type
                currentCount
                totalCount
            }
        }
    }
`

const QUERY_NODE_STATUS = gql`
    query {
        nodeStatus {
            bootstrapEnded
            preloadEnded
        }
    }
`

const { ipcRenderer } = window

export default function LobbyView(props: any) {
    const [isDownloaded, setDownloadState] = useState(false);
    const [progressPercentages, setProgressPercentages] = useState(0);

    ipcRenderer.on("download progress", (event, progress) => {
        setDownloadState(true);
        setProgressPercentages(progress.percent * 100);
    });

    ipcRenderer.on("download complete", (event, path) => {
        setDownloadState(false);
    });

    const executeGame = () => {
        ipcRenderer.send("launch game", {
            args: [
                `--private-key=${props.privateKey}`,
                `--rpc-client=${true}`,
                `--rpc-server-host=${RPC_LOOPBACK_HOST}`,
                `--rpc-server-port=${standaloneProperties.RpcListenPort}`,
            ]
        })
    };

    const downloadSnapShot = () => {
        ipcRenderer.send("download snapshot", {
            properties: {}
        });
    };

    const {
        data: preloadProgressSubscriptionResult,
        loading: preloadProgressLoading,
    } = useSubscription<PreloadProgressSubscriptionResult>(SUBSCRIPTION_PRELOAD_PROGRESS);
    const {
        data: nodeStatusQueryResult,
    } = useQuery<NodeStatusQueryResult>(QUERY_NODE_STATUS);

    // preload가 끝나고 바로 nodeStatus가 갱신되는 것이 아니라서 추측을 통해 nodeStatus 값을 갱신해줍니다.
    // FIXME: 주기적으로 검사하는 코드로 고치는 것이 좋을 것 같습니다. (setInterval)
    if (undefined !== nodeStatusQueryResult?.nodeStatus) {
        const nodeStatus = nodeStatusQueryResult.nodeStatus;
        nodeStatus.bootstrapEnded = undefined !== preloadProgressSubscriptionResult?.preloadProgress;
        if (undefined !== preloadProgressSubscriptionResult?.preloadProgress) {
            nodeStatus.preloadEnded =
                preloadProgressSubscriptionResult?.preloadProgress.currentPhase >= 4
                    && preloadProgressSubscriptionResult?.preloadProgress.extra.totalCount === preloadProgressSubscriptionResult?.preloadProgress.extra.currentCount;
        }
    }
    
    return (
        <div>
            <label>You are using address: {props.address}</label><br/>
            <button disabled={isDownloaded} onClick={(event: React.MouseEvent) => { executeGame() }}>Start Game</button>
            <button onClick={(event: React.MouseEvent) => { downloadSnapShot() }}>Download Snapshot</button>
            <br />
            {isDownloaded ? <label>{progressPercentages}</label> : null}
            <br />
            {
                preloadProgressLoading || nodeStatusQueryResult?.nodeStatus.preloadEnded
                    ? <></>
                    : (
                        <>
                            <p>Preload Status</p>
                            <p>{preloadProgressSubscriptionResult?.preloadProgress.extra.type} {preloadProgressSubscriptionResult?.preloadProgress.extra.currentCount} / {preloadProgressSubscriptionResult?.preloadProgress.extra.totalCount}</p>
                        </>
                )
            }
            
        </div>
    );
}

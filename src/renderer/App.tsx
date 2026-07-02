import { ApolloProvider } from "@apollo/client";
import React, { useCallback, useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import { HashRouter as Router } from "react-router-dom";
import Routes from "./Routes";
import useApolloClient from "src/utils/apolloClient";
import APVSubscriptionProvider from "src/utils/APVSubscriptionProvider";
import "./global.scss";
import { StoreProvider, useStore } from "src/utils/useStore";
import { LocaleProvider } from "src/renderer/i18n";
import { ExternalURLProvider } from "src/utils/useExternalURL";
import { observer } from "mobx-react";
import { Planet } from "src/interfaces/registry";
import { NodeInfo } from "src/config";
import ConnectionErrorView from "src/renderer/components/core/ConnectionErrorView";
import { useNodeHealth } from "src/utils/useNodeHealth";

// ApolloProvider 하위에서 돌면서 붙어 있는 노드의 tip 진행을 감시한다.
// 노드가 런타임에 블록을 더 이상 안 먹여주면(desync/hang) onUnhealthy를 호출해
// 상위(App)의 연결에러 경로 = ConnectionErrorView + retry-planetary-init 로 넘긴다.
function NodeHealthMonitor({ onUnhealthy }: { onUnhealthy: () => void }) {
  const { healthy } = useNodeHealth();
  useEffect(() => {
    if (!healthy) onUnhealthy();
  }, [healthy, onUnhealthy]);
  return null;
}

function App() {
  const { planetary, account, game } = useStore();
  const client = useApolloClient();
  const [initError, setInitError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handlePlanetaryResult = (result: {
    data?: [Planet[], NodeInfo, Planet[]];
    error?: string;
  }) => {
    if (result.error) {
      setInitError(result.error);
      setRetryCount((c) => c + 1);
      return;
    }
    if (result.data) {
      setInitError(null);
      planetary.init(result.data[0], result.data[1], result.data[2]);
    }
  };

  const refreshGeoBlock = () => {
    ipcRenderer
      .invoke("check-geoblock")
      .then((v) => game.setGeoBlock(v.country, v.isWhitelist ?? false));
  };

  // 런타임에 노드 연결이 끊긴 것으로 판단되면 초기 init 실패와 동일한 에러 경로로 보낸다.
  const handleNodeUnhealthy = useCallback(() => {
    setInitError((prev) => prev ?? "Connection to the node was lost.");
    setRetryCount((c) => c + 1);
  }, []);

  useEffect(() => {
    ipcRenderer.invoke("get-planetary-info").then(handlePlanetaryResult);
    refreshGeoBlock();
  }, []);

  if (initError) {
    return (
      <ConnectionErrorView
        error={initError}
        onRetry={() => {
          ipcRenderer.invoke("retry-planetary-init").then((result) => {
            handlePlanetaryResult(result);
            if (!result.error) refreshGeoBlock();
          });
        }}
        key={retryCount}
      />
    );
  }

  if (planetary.node === null) return null;
  if (!account.isInitialized) return null;
  if (client === null) return null;

  return (
    <LocaleProvider>
      <ApolloProvider client={client}>
        <NodeHealthMonitor onUnhealthy={handleNodeUnhealthy} />
        <StoreProvider>
          <APVSubscriptionProvider>
            <ExternalURLProvider>
              <Router>
                <Routes />
              </Router>
            </ExternalURLProvider>
          </APVSubscriptionProvider>
        </StoreProvider>
      </ApolloProvider>
    </LocaleProvider>
  );
}

export default observer(App);

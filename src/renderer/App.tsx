import { ApolloProvider } from "@apollo/client";
import React, { useEffect, useState } from "react";
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

function ConnectionErrorView({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  const [retrying, setRetrying] = useState(false);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1d1e1f",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ color: "#74f4bc", marginBottom: 16 }}>Connection Failed</h1>
      <p style={{ maxWidth: 400, textAlign: "center", marginBottom: 24 }}>
        Unable to connect to the Nine Chronicles network. Please check your
        internet connection.
      </p>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 24 }}>{error}</p>
      <button
        onClick={() => {
          setRetrying(true);
          onRetry();
        }}
        disabled={retrying}
        style={{
          backgroundColor: retrying ? "#555" : "#3e2a8d",
          color: "white",
          border: "none",
          padding: "12px 36px",
          fontSize: 16,
          fontWeight: "bold",
          cursor: retrying ? "default" : "pointer",
          borderRadius: 4,
        }}
      >
        {retrying ? "Retrying..." : "Retry"}
      </button>
    </div>
  );
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

  useEffect(() => {
    ipcRenderer.invoke("get-planetary-info").then(handlePlanetaryResult);
    ipcRenderer
      .invoke("check-geoblock")
      .then((v) => game.setGeoBlock(v.country, v.isWhitelist ?? false));
  }, []);

  if (initError) {
    return (
      <ConnectionErrorView
        error={initError}
        onRetry={() => {
          ipcRenderer
            .invoke("retry-planetary-init")
            .then(handlePlanetaryResult);
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

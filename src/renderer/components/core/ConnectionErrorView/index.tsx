import React, { useState } from "react";

interface ConnectionErrorViewProps {
  error: string;
  onRetry: () => void;
  title?: string;
  description?: string;
}

// 노드 연결 실패 / 런타임 연결 손실 / 렌더 예외 등에서 공통으로 쓰는 폴백 화면.
// App(초기 init 실패), ErrorBoundary(렌더 예외), NodeHealthMonitor(런타임 연결 손실)에서 재사용한다.
function ConnectionErrorView({
  error,
  onRetry,
  title = "Connection Failed",
  description = "Unable to connect to the Nine Chronicles network. Please check your internet connection.",
}: ConnectionErrorViewProps) {
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
      <h1 style={{ color: "#74f4bc", marginBottom: 16 }}>{title}</h1>
      <p style={{ maxWidth: 400, textAlign: "center", marginBottom: 24 }}>
        {description}
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

export default ConnectionErrorView;

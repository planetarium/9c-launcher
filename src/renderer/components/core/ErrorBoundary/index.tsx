import React from "react";
import { ipcRenderer } from "electron";
import ConnectionErrorView from "../ConnectionErrorView";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// 렌더 트리에서 던져진 예외를 잡아 흰화면 대신 폴백 UI를 띄우고 로그를 남긴다.
// 이게 없으면 렌더 예외 시 React가 트리를 통째로 언마운트해 빈 흰 화면이 된다.
export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // console.* 는 electron-log로 연결되어 renderer.log에 기록된다.
    console.error(
      "[ErrorBoundary] Uncaught render error:",
      error,
      info.componentStack,
    );
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <ConnectionErrorView
          title="Something went wrong"
          description="The launcher ran into an unexpected error. Retrying will restart the launcher."
          error={error.message}
          // 노드를 다시 고른 뒤(retry-planetary-init) 렌더러를 재시작해
          // 같은 불량 노드로 재접속하는 것을 피한다.
          onRetry={() => {
            ipcRenderer
              .invoke("retry-planetary-init")
              .finally(() => location.reload());
          }}
        />
      );
    }
    return this.props.children;
  }
}

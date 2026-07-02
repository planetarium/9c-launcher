import { useApolloClient } from "@apollo/client";
import { useEffect, useState } from "react";
import { get } from "src/config";
import { TipDocument, TipSubscription } from "src/generated/graphql";

// 마지막 tip 갱신 이후 이 시간(ms) 동안 새 블록이 안 오면 노드가 죽은 것으로 간주.
// 블록 간격(~8s) 기준 약 3~4블록 → 정상 지연(1~2블록 jitter) 오탐은 피하면서
// 무소식은 빠르게 감지. get-planetary-info / graphql 재시도의 30s 상한과도 일관.
export const NODE_HEALTH_STALE_MS = 30_000;

// 설정(NodeHealthStaleMs)에 유효한 양수가 있으면 그 값을, 없으면 기본 30s를 쓴다.
// 배포 후에도 재빌드 없이 원격 config로 임계값을 조절할 수 있게 한다.
function resolveStaleMs(): number {
  const configured = get("NodeHealthStaleMs", NODE_HEALTH_STALE_MS);
  return typeof configured === "number" && configured > 0
    ? configured
    : NODE_HEALTH_STALE_MS;
}

// 붙어 있는 노드가 런타임에 블록을 더 이상 안 먹여주면(desync/hang) unhealthy로 전환한다.
// 첫 tip이 staleMs 안에 한 번도 안 오면(=죽은 노드에 붙은 채 시작) 그것도 unhealthy.
//
// 오탐 방지:
// - blind setTimeout 대신 "마지막 tip 이후 실제 경과 시간(wall-clock)"으로 판정한다.
//   랩탑 sleep/백그라운드 타이머 스로틀로 프로세스가 멈췄다 깨어나도 잘못 만료되지 않는다.
// - 백그라운드(hidden) 구간에는 판정을 보류하고, 화면 복귀/네트워크 복구 시 기준 시각을
//   리셋해 재연결된 구독이 tip을 받을 새 window를 준다.
// - 구독 error는 로그만 남기고 stale 판정에 위임한다(일시적 WS 오류에 즉시 튕기지 않도록).
export function useNodeHealth(staleMs: number = resolveStaleMs()): {
  healthy: boolean;
} {
  const client = useApolloClient();
  const [healthy, setHealthy] = useState(true);

  useEffect(() => {
    let lastTipAt = Date.now();

    // 화면 복귀/온라인 복구: 그동안 tip을 못 받은 건 노드 탓이 아니므로 window를 리셋.
    const resetWindow = () => {
      lastTipAt = Date.now();
      setHealthy(true);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") resetWindow();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", resetWindow);

    const checkInterval = setInterval(
      () => {
        // 백그라운드면 판정 보류(복귀 시 resetWindow가 새 window를 준다).
        if (document.visibilityState !== "visible") return;
        if (Date.now() - lastTipAt >= staleMs) {
          console.error(
            `[useNodeHealth] no tip update for ${staleMs}ms — treating node as unhealthy`,
          );
          setHealthy(false);
        }
      },
      Math.min(staleMs, 5000),
    );

    const subscription = client
      .subscribe<TipSubscription>({ query: TipDocument })
      .subscribe({
        next(result) {
          if (!result.data || !result.data.tipChanged) return;
          lastTipAt = Date.now();
          setHealthy(true);
        },
        // 일시적 오류는 로그만 — 진짜 죽은 노드는 위 stale 판정이 잡는다.
        error(error) {
          console.error("[useNodeHealth] tip subscription error:", error);
        },
      });

    return () => {
      clearInterval(checkInterval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", resetWindow);
      subscription.unsubscribe();
    };
  }, [client, staleMs]);

  return { healthy };
}

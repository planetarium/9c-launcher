export interface WeightedNode {
  rttMs: number;
  clientCount: number;
}

export interface NodeSelectorOptions {
  rttAlpha?: number;
  rttFloorMs?: number;
}

// 20ms 미만 RTT 차이는 측정 노이즈로 간주, 동등 취급
export const RTT_FLOOR_MS = 20;
// 1.0이면 선형(rtt 2배 → 가중치 1/2). >1이면 빠른 노드 편중 강화.
export const RTT_ALPHA = 1.0;

export function rttClientWeightedSelector<T extends WeightedNode>(
  nodeList: T[],
  opts: NodeSelectorOptions = {},
): T {
  if (nodeList.length <= 1) {
    return nodeList[0];
  }

  const rttAlpha = opts.rttAlpha ?? RTT_ALPHA;
  const rttFloor = opts.rttFloorMs ?? RTT_FLOOR_MS;

  const weights = nodeList.map((node) => {
    const effectiveRtt = Math.max(node.rttMs, rttFloor);
    const rttTerm = Number.isFinite(effectiveRtt)
      ? Math.pow(rttFloor / effectiveRtt, rttAlpha)
      : 0;
    // clientCount=0(데이터 부재)도 1로 클램프해 RTT 가중치만 효과적으로 적용
    const clientTerm = 1 / Math.max(1, node.clientCount);
    return rttTerm * clientTerm;
  });

  const totalWeight = weights.reduce((p, v) => p + v, 0);

  // 모든 가중치 0 (예: 전부 Infinity RTT) → 균등 랜덤
  if (totalWeight <= 0) {
    return nodeList[Math.floor(Math.random() * nodeList.length)];
  }

  const target = Math.random() * totalWeight;
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    // strict >: target=0일 때 weight=0 노드가 선택되는 invariant 위반 방지
    if (cumulative > target) {
      return nodeList[i];
    }
  }
  return nodeList[nodeList.length - 1];
}

// 첫 응답 후 추가 후보 수집을 위해 기다리는 시간
export const NODE_GRACE_PERIOD_MS = 500;

// 첫 응답까지 대기한 후 graceMs 동안 추가 응답을 수집한다.
// promise가 reject하더라도 throw하지 않는다.
export async function waitFirstThenGrace(
  promises: Promise<unknown>[],
  graceMs: number = NODE_GRACE_PERIOD_MS,
): Promise<void> {
  if (promises.length === 0) return;
  const safe = promises.map((p) => p.catch(() => undefined));
  await Promise.race(safe);
  await Promise.race([
    Promise.all(safe),
    new Promise<void>((resolve) => setTimeout(resolve, graceMs)),
  ]);
}

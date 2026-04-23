export interface WeightedNode {
  rttMs: number;
  clientCount: number;
}

export interface NodeSelectorOptions {
  rttAlpha?: number;
  rttFloorMs?: number;
}

export const RTT_FLOOR_MS = 20;
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
    if (cumulative >= target) {
      return nodeList[i];
    }
  }
  return nodeList[nodeList.length - 1];
}

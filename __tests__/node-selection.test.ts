import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  NODE_GRACE_PERIOD_MS,
  rttClientWeightedSelector,
  waitFirstThenGrace,
  WeightedNode,
} from "src/utils/nodeSelector";

interface MockNode extends WeightedNode {
  gqlUrl: string;
}

function sample(fn: () => MockNode, n: number): Record<string, number> {
  const counts: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    const node = fn();
    counts[node.gqlUrl] = (counts[node.gqlUrl] ?? 0) + 1;
  }
  return counts;
}

describe("rttClientWeightedSelector", () => {
  it("노드 1개면 그대로 반환", () => {
    const node: MockNode = { rttMs: 100, clientCount: 5, gqlUrl: "a" };
    expect(rttClientWeightedSelector([node])).toBe(node);
  });

  it("동일 조건 3노드는 균등 분포", () => {
    const nodes: MockNode[] = [
      { rttMs: 50, clientCount: 10, gqlUrl: "a" },
      { rttMs: 50, clientCount: 10, gqlUrl: "b" },
      { rttMs: 50, clientCount: 10, gqlUrl: "c" },
    ];
    const counts = sample(() => rttClientWeightedSelector(nodes), 10000);
    // 각 ~33% ± 3%
    expect(counts["a"]).toBeGreaterThan(3000);
    expect(counts["a"]).toBeLessThan(3700);
    expect(counts["b"]).toBeGreaterThan(3000);
    expect(counts["b"]).toBeLessThan(3700);
    expect(counts["c"]).toBeGreaterThan(3000);
    expect(counts["c"]).toBeLessThan(3700);
  });

  it("RTT 차이 큰 경우 빠른 노드가 압도적으로 선택", () => {
    const nodes: MockNode[] = [
      { rttMs: 10, clientCount: 5, gqlUrl: "fast" },
      { rttMs: 200, clientCount: 5, gqlUrl: "slow" },
    ];
    const counts = sample(() => rttClientWeightedSelector(nodes), 10000);
    // fast는 약 20ms floor 적용, slow는 200ms → fast가 ~10배 가중치
    expect(counts["fast"]).toBeGreaterThan(counts["slow"] * 5);
  });

  it("동일 RTT, clientCount 차이 → 적은 쪽 더 많이", () => {
    const nodes: MockNode[] = [
      { rttMs: 50, clientCount: 1, gqlUrl: "empty" },
      { rttMs: 50, clientCount: 10, gqlUrl: "busy" },
    ];
    const counts = sample(() => rttClientWeightedSelector(nodes), 10000);
    // empty가 ~10배 자주 선택
    expect(counts["empty"]).toBeGreaterThan(counts["busy"] * 5);
  });

  it("가깝지만 포화 vs 멀지만 여유 트레이드오프", () => {
    const nodes: MockNode[] = [
      // 10ms(floor=20 적용), 20 clients → rttTerm=1.0, clientTerm=1/20, weight=0.05
      { rttMs: 10, clientCount: 20, gqlUrl: "close-busy" },
      // 200ms, 1 client → rttTerm=0.1, clientTerm=1.0, weight=0.1
      { rttMs: 200, clientCount: 1, gqlUrl: "far-empty" },
    ];
    const counts = sample(() => rttClientWeightedSelector(nodes), 10000);
    // far-empty가 더 많이 선택되어야 함 (0.1 vs 0.05)
    expect(counts["far-empty"]).toBeGreaterThan(counts["close-busy"]);
  });

  it("RTT floor 이하는 동일 취급", () => {
    const nodes: MockNode[] = [
      { rttMs: 1, clientCount: 10, gqlUrl: "a" },
      { rttMs: 15, clientCount: 10, gqlUrl: "b" },
    ];
    const counts = sample(() => rttClientWeightedSelector(nodes), 10000);
    // 둘 다 rttTerm=1.0, clientTerm 동일 → ~50:50
    expect(counts["a"]).toBeGreaterThan(4500);
    expect(counts["a"]).toBeLessThan(5500);
  });

  it("모든 노드 RTT=Infinity면 균등 랜덤 fallback", () => {
    const nodes: MockNode[] = [
      { rttMs: Infinity, clientCount: 1, gqlUrl: "a" },
      { rttMs: Infinity, clientCount: 10, gqlUrl: "b" },
      { rttMs: Infinity, clientCount: 100, gqlUrl: "c" },
    ];
    const counts = sample(() => rttClientWeightedSelector(nodes), 10000);
    // 세 노드 모두 비슷하게 선택 (균등 랜덤)
    expect(counts["a"]).toBeGreaterThan(3000);
    expect(counts["b"]).toBeGreaterThan(3000);
    expect(counts["c"]).toBeGreaterThan(3000);
  });

  it("가중치 합 0이어도 throw하지 않음", () => {
    const nodes: MockNode[] = [
      { rttMs: Infinity, clientCount: 1, gqlUrl: "a" },
      { rttMs: Infinity, clientCount: 1, gqlUrl: "b" },
    ];
    expect(() => rttClientWeightedSelector(nodes)).not.toThrow();
    const result = rttClientWeightedSelector(nodes);
    expect(["a", "b"]).toContain(result.gqlUrl);
  });
});

describe("waitFirstThenGrace", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // 각 엔드포인트의 응답 지연(ms). 음수면 reject. NodeList의
  // connectionCheck 셰이프(성공 시 nodeList push)를 시뮬레이션한다.
  function simulateConnections(delays: number[]): {
    promises: Promise<void>[];
    collected: number[];
  } {
    const collected: number[] = [];
    const promises = delays.map(
      (delay, i) =>
        new Promise<void>((resolve, reject) => {
          if (delay < 0) {
            setTimeout(() => reject(new Error("fail")), -delay);
          } else {
            setTimeout(() => {
              collected.push(i);
              resolve();
            }, delay);
          }
        }),
    );
    return { promises, collected };
  }

  it("grace 상수가 500ms로 노출", () => {
    expect(NODE_GRACE_PERIOD_MS).toBe(500);
  });

  it("두 엔드포인트 100ms 응답 → 둘 다 수집", async () => {
    const { promises, collected } = simulateConnections([100, 100]);
    const done = waitFirstThenGrace(promises);
    await vi.advanceTimersByTimeAsync(150);
    await done;
    expect(collected).toHaveLength(2);
  });

  it("50ms + 3000ms → 빠른 것만, grace 만료로 탈출", async () => {
    const { promises, collected } = simulateConnections([50, 3000]);
    const done = waitFirstThenGrace(promises);
    // 50ms 응답 + 500ms grace
    await vi.advanceTimersByTimeAsync(600);
    await done;
    expect(collected).toHaveLength(1);
    expect(collected[0]).toBe(0);
  });

  it("단일 엔드포인트 성공 → 즉시 반환", async () => {
    const { promises, collected } = simulateConnections([100]);
    const done = waitFirstThenGrace(promises);
    await vi.advanceTimersByTimeAsync(150);
    await done;
    expect(collected).toEqual([0]);
  });

  it("전부 reject해도 throw하지 않음", async () => {
    const { promises, collected } = simulateConnections([-100, -200]);
    const done = waitFirstThenGrace(promises);
    await vi.advanceTimersByTimeAsync(300);
    await expect(done).resolves.toBeUndefined();
    expect(collected).toHaveLength(0);
  });

  it("빈 promise 배열 → 즉시 반환", async () => {
    await expect(waitFirstThenGrace([])).resolves.toBeUndefined();
  });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, Server } from "http";
import { AddressInfo } from "net";
import {
  rttClientWeightedSelector,
  waitFirstThenGrace,
} from "src/utils/nodeSelector";

interface FakeNode {
  server: Server;
  url: string;
  delayMs: number;
}

async function createFakeNode(
  delayMs: number,
  opts: { clientCount?: number; tip?: number } = {},
): Promise<FakeNode> {
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      setTimeout(() => {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            data: {
              nodeStatus: {
                preloadEnded: true,
                tip: { index: opts.tip ?? 100 },
                appProtocolVersion: { version: 1 },
              },
              rpcInformation: { totalCount: opts.clientCount ?? 1 },
            },
          }),
        );
      }, delayMs);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return { server, url: `http://127.0.0.1:${port}/graphql`, delayMs };
}

async function closeFakeNode(node: FakeNode): Promise<void> {
  await new Promise<void>((resolve) => node.server.close(() => resolve()));
}

interface ProbedNode {
  url: string;
  rttMs: number;
  clientCount: number;
  tip: number;
}

/**
 * src/config.ts의 NodeList(quick=true) + PreloadEnded 흐름을 재현합니다.
 * 대기 패턴은 production helper(waitFirstThenGrace)를 직접 사용.
 */
async function probeWithGrace(
  urls: string[],
  graceMs?: number,
): Promise<ProbedNode[]> {
  const results: ProbedNode[] = [];

  const probes = urls.map(async (url) => {
    const started = performance.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "{ nodeStatus { preloadEnded } }" }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.status === 200) {
        const data = (await response.json()) as {
          data?: {
            nodeStatus: { preloadEnded: boolean; tip: { index: number } };
            rpcInformation: { totalCount: number };
          };
        };
        if (data?.data?.nodeStatus?.preloadEnded) {
          const rttMs = performance.now() - started;
          results.push({
            url,
            rttMs,
            clientCount: data.data.rpcInformation.totalCount,
            tip: data.data.nodeStatus.tip.index,
          });
        }
      }
    } catch {
      // NodeList와 동일하게 실패는 무시
    }
  });

  await waitFirstThenGrace(probes, graceMs);
  return [...results];
}

describe("노드 선택 통합 테스트 (HTTP 서버)", () => {
  let fast: FakeNode;
  let medium: FakeNode;
  let slow: FakeNode;

  beforeAll(async () => {
    fast = await createFakeNode(50, { clientCount: 5 });
    medium = await createFakeNode(150, { clientCount: 5 });
    slow = await createFakeNode(400, { clientCount: 5 });
  }, 10000);

  afterAll(async () => {
    await Promise.all([fast, medium, slow].map(closeFakeNode));
  });

  it("probe 후 grace period 내 응답한 후보들이 수집됨", async () => {
    const probed = await probeWithGrace([fast.url, medium.url, slow.url]);
    // fast(50) + medium(150)은 확실히, slow(400)는 grace(500ms)에 경계
    expect(probed.length).toBeGreaterThanOrEqual(2);
    expect(probed.some((p) => p.url === fast.url)).toBe(true);
    // RTT가 실제 지연을 반영하는지
    const fastProbe = probed.find((p) => p.url === fast.url);
    expect(fastProbe!.rttMs).toBeGreaterThan(40);
    expect(fastProbe!.rttMs).toBeLessThan(200);
  }, 10000);

  it("동일 clientCount에서 빠른 노드가 반복적으로 더 많이 선택됨", async () => {
    const selections: string[] = [];
    const iterations = 30;

    for (let i = 0; i < iterations; i++) {
      const probed = await probeWithGrace([fast.url, medium.url, slow.url]);
      if (probed.length === 0) continue;
      const selected = rttClientWeightedSelector(probed);
      selections.push(selected.url);
    }

    const fastCount = selections.filter((s) => s === fast.url).length;
    const slowCount = selections.filter((s) => s === slow.url).length;

    // 빠른 노드가 느린 노드보다 확실히 더 많이 선택되어야 함
    expect(fastCount).toBeGreaterThan(slowCount);
    // fast는 절반 이상
    expect(fastCount).toBeGreaterThan(iterations / 3);
  }, 45000);

  it("응답 없는 서버는 후보에서 제외됨", async () => {
    // 닫힌 포트로 요청 → 즉시 연결 거부
    const probed = await probeWithGrace([
      fast.url,
      "http://127.0.0.1:1/graphql",
    ]);
    expect(probed.map((p) => p.url)).toEqual([fast.url]);
  }, 10000);
});

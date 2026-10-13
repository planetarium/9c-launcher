import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import http from "http";
import { AddressInfo } from "net";
import {
  filterAccessiblePlanets,
  probeEndpoint,
  PLANET_CHECK_TIMEOUT_MS,
} from "src/main/planetAccess";
import { Planet } from "src/interfaces/registry";

/**
 * 레지스트리의 외부 노드 하나(odin5.9capi.com)가 TLS까진 붙고 응답 없이
 * 61초 뒤 504를 주자, Promise.all로 전 엔드포인트를 기다리던 체크가
 * get-planetary-info의 30초 대기를 넘겨 "Timed out waiting for node
 * initialization."으로 런처 전체가 접속 불가가 됐다.
 */

const planet = (id: string, endpoints: string[]): Planet => ({
  id,
  rpcEndpoints: { "headless.gql": endpoints, "headless.grpc": [] },
});

const never = () => new Promise<boolean>(() => {});

describe("filterAccessiblePlanets", () => {
  it("응답 없는 엔드포인트가 있어도 정상 엔드포인트 응답 즉시 통과", async () => {
    const probe = vi.fn((endpoint: string) =>
      endpoint === "hang" ? never() : Promise.resolve(true),
    );

    const result = await filterAccessiblePlanets(
      [planet("odin", ["ok", "hang"]), planet("heimdall", ["hang", "ok"])],
      probe,
    );

    expect(result.map((p) => p.id)).toEqual(["odin", "heimdall"]);
  });

  it("모든 엔드포인트가 실패한 플래닛만 제외하고 순서 유지", async () => {
    const probe = vi.fn((endpoint: string) =>
      Promise.resolve(endpoint === "ok"),
    );

    const result = await filterAccessiblePlanets(
      [
        planet("a", ["ok"]),
        planet("b", ["bad", "bad"]),
        planet("c", ["bad", "ok"]),
      ],
      probe,
    );

    expect(result.map((p) => p.id)).toEqual(["a", "c"]);
  });

  it("엔드포인트가 없는 플래닛은 접근 불가", async () => {
    const result = await filterAccessiblePlanets(
      [planet("empty", [])],
      vi.fn(),
    );
    expect(result).toEqual([]);
  });
});

describe("probeEndpoint", () => {
  const TEST_TIMEOUT_MS = 300;
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      if (req.url === "/ok") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end('{"data":{"nodeStatus":{"bootstrapEnded":true}}}');
      } else if (req.url === "/trickle") {
        // 헤더는 보내고 본문을 조금씩 흘린다 (소켓 idle timeout으로는 안 끊김)
        res.writeHead(200, { "content-type": "application/json" });
        const timer = setInterval(() => res.write(" "), 50);
        res.on("close", () => clearInterval(timer));
      }
      // 그 외: 연결만 받고 응답하지 않음 (odin5.9capi.com 장애 형태)
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => {
    server.closeAllConnections();
    server.close();
  });

  it("정상 응답이면 true", async () => {
    await expect(probeEndpoint(`${baseUrl}/ok`, TEST_TIMEOUT_MS)).resolves.toBe(
      true,
    );
  });

  it("연결만 받고 응답 없는 서버는 timeout 안에 false", async () => {
    const start = Date.now();
    await expect(
      probeEndpoint(`${baseUrl}/hang`, TEST_TIMEOUT_MS),
    ).resolves.toBe(false);
    expect(Date.now() - start).toBeLessThan(TEST_TIMEOUT_MS * 3);
  });

  it("본문을 조금씩 흘리는 서버도 timeout 안에 false", async () => {
    const start = Date.now();
    await expect(
      probeEndpoint(`${baseUrl}/trickle`, TEST_TIMEOUT_MS),
    ).resolves.toBe(false);
    expect(Date.now() - start).toBeLessThan(TEST_TIMEOUT_MS * 3);
  });

  it("기본 timeout은 get-planetary-info 대기(30초)보다 충분히 짧다", () => {
    expect(PLANET_CHECK_TIMEOUT_MS).toBeLessThanOrEqual(10_000);
  });
});

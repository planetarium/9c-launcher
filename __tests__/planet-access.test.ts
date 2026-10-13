import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
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
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("요청마다 타임아웃을 건다", async () => {
    const post = vi
      .spyOn(axios, "post")
      .mockResolvedValue({ status: 200 } as never);

    await expect(probeEndpoint("https://node/graphql")).resolves.toBe(true);
    expect(post).toHaveBeenCalledWith(
      "https://node/graphql",
      expect.anything(),
      expect.objectContaining({ timeout: PLANET_CHECK_TIMEOUT_MS }),
    );
    expect(PLANET_CHECK_TIMEOUT_MS).toBeLessThan(30_000);
  });

  it("요청 실패(타임아웃 포함) 시 false", async () => {
    vi.spyOn(axios, "post").mockRejectedValue(
      new Error("timeout of 5000ms exceeded"),
    );
    await expect(probeEndpoint("https://node/graphql")).resolves.toBe(false);
  });
});

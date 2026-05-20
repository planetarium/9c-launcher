import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * PLD-1333 회귀 테스트.
 *
 * 오프라인 부팅 시 initGeoBlocking 실패로 geoBlock이 undefined로 남으면
 * check-geoblock IPC가 영원히 resolve되지 않고, GameStore는 기본값
 * (KR/non-whitelist)을 유지해 Start 버튼이 disabled된다.
 *
 * Electron 의존성을 피하기 위해 src/main/main.ts의 initGeoBlocking 로직을
 * 동일하게 재현해 fix의 명세를 잠근다.
 */

const GEOBLOCK_URL = "https://country-checker.nine-chronicles.com/";

type GeoBlock = { ip?: string; country: string; isWhitelist?: boolean };

/**
 * src/main/main.ts:594 initGeoBlocking 구현을 재현.
 * fetch 실패 시에도 geoBlock이 정의된 상태로 끝나야 한다.
 */
function makeInitGeoBlocking(deps: {
  localStorageGetItem: (key: string) => Promise<string | null>;
}) {
  let geoBlock: GeoBlock | undefined;

  async function initGeoBlocking(): Promise<void> {
    try {
      const response = await fetch(GEOBLOCK_URL);
      geoBlock = (await response.json()) as GeoBlock;
    } catch {
      const stored = await deps
        .localStorageGetItem("country")
        .catch(() => null);
      geoBlock = {
        country: stored ?? "KR",
        isWhitelist: false,
      };
    }
  }

  return {
    initGeoBlocking,
    getGeoBlock: () => geoBlock,
    resetGeoBlock: () => {
      geoBlock = undefined;
    },
  };
}

describe("PLD-1333: initGeoBlocking", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("offline (fetch 실패)", () => {
    beforeEach(() => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("network down")),
      );
    });

    it("localStorage 값이 있으면 그 값으로 geoBlock 초기화", async () => {
      const { initGeoBlocking, getGeoBlock } = makeInitGeoBlocking({
        localStorageGetItem: vi.fn().mockResolvedValue("US"),
      });
      await initGeoBlocking();
      expect(getGeoBlock()).toEqual({ country: "US", isWhitelist: false });
    });

    it("localStorage가 비어있으면 KR로 fallback (가장 엄격)", async () => {
      const { initGeoBlocking, getGeoBlock } = makeInitGeoBlocking({
        localStorageGetItem: vi.fn().mockResolvedValue(null),
      });
      await initGeoBlocking();
      expect(getGeoBlock()).toEqual({ country: "KR", isWhitelist: false });
    });

    it("localStorage 조회 자체가 reject해도 KR로 fallback", async () => {
      const { initGeoBlocking, getGeoBlock } = makeInitGeoBlocking({
        localStorageGetItem: vi.fn().mockRejectedValue(new Error("no win")),
      });
      await initGeoBlocking();
      expect(getGeoBlock()).toEqual({ country: "KR", isWhitelist: false });
    });

    it("초기화 후 geoBlock은 항상 정의됨 (check-geoblock 무한 대기 방지)", async () => {
      const { initGeoBlocking, getGeoBlock } = makeInitGeoBlocking({
        localStorageGetItem: vi.fn().mockResolvedValue(null),
      });
      await initGeoBlocking();
      expect(getGeoBlock()).toBeDefined();
    });
  });

  describe("online (fetch 성공)", () => {
    it("응답 값으로 geoBlock 설정", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          json: async () => ({
            ip: "1.2.3.4",
            country: "JP",
            isWhitelist: true,
          }),
        }),
      );
      const { initGeoBlocking, getGeoBlock } = makeInitGeoBlocking({
        localStorageGetItem: vi.fn().mockResolvedValue(null),
      });
      await initGeoBlocking();
      expect(getGeoBlock()).toEqual({
        ip: "1.2.3.4",
        country: "JP",
        isWhitelist: true,
      });
    });
  });

  describe("retry 시나리오", () => {
    it("오프라인 → 온라인 재시도 시 새 응답으로 갱신", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
      const { initGeoBlocking, getGeoBlock, resetGeoBlock } =
        makeInitGeoBlocking({
          localStorageGetItem: vi.fn().mockResolvedValue(null),
        });

      // 1차: offline → KR fallback
      await initGeoBlocking();
      expect(getGeoBlock()).toEqual({ country: "KR", isWhitelist: false });

      // 2차: 온라인 복귀 후 retry → 새 응답
      vi.unstubAllGlobals();
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          json: async () => ({
            ip: "1.2.3.4",
            country: "JP",
            isWhitelist: true,
          }),
        }),
      );
      resetGeoBlock(); // main.ts의 retry-planetary-init이 하는 일을 재현
      await initGeoBlocking();
      expect(getGeoBlock()).toEqual({
        ip: "1.2.3.4",
        country: "JP",
        isWhitelist: true,
      });
    });
  });
});

describe("PLD-1333: GameStore isGameBlocked 게이팅", () => {
  // src/stores/game.ts:46
  function isGameBlocked(country: string, whitelist: boolean): boolean {
    return ["KR"].includes(country) && !whitelist;
  }

  it("setGeoBlock이 한 번도 호출되지 않으면 KR/false 기본값으로 Start disabled", () => {
    // 기본값: _country="KR", _whitelist=false
    expect(isGameBlocked("KR", false)).toBe(true);
  });

  it("오프라인 fallback (KR/false)도 동일하게 Start disabled", () => {
    expect(isGameBlocked("KR", false)).toBe(true);
  });

  it("온라인 재시도 후 정상 country면 Start enabled", () => {
    expect(isGameBlocked("JP", true)).toBe(false);
    expect(isGameBlocked("US", false)).toBe(false);
  });
});

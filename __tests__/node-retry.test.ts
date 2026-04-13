import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * initializeNodeWithRetry 로직을 테스트하기 위해
 * Electron 의존성 없이 동일한 로직을 재현합니다.
 */

type InitFn = () => Promise<string>;

async function initializeNodeWithRetry(
  initFn: InitFn,
  maxRetries: number = 2,
  baseDelayMs: number = 1000,
): Promise<string> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await initFn();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError!;
}

describe("initializeNodeWithRetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("첫 시도 성공 시 재시도 없이 반환", async () => {
    const initFn = vi.fn().mockResolvedValue("node-1");

    const promise = initializeNodeWithRetry(initFn);
    const result = await promise;

    expect(result).toBe("node-1");
    expect(initFn).toHaveBeenCalledTimes(1);
  });

  it("2번째 시도에서 성공", async () => {
    const initFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce("node-2");

    const promise = initializeNodeWithRetry(initFn);

    // 첫 번째 실패 후 1초 대기
    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;
    expect(result).toBe("node-2");
    expect(initFn).toHaveBeenCalledTimes(2);
  });

  it("3번째 시도에서 성공", async () => {
    const initFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail-1"))
      .mockRejectedValueOnce(new Error("fail-2"))
      .mockResolvedValueOnce("node-3");

    const promise = initializeNodeWithRetry(initFn);

    // 1초 (1st backoff) + 2초 (2nd backoff)
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);

    const result = await promise;
    expect(result).toBe("node-3");
    expect(initFn).toHaveBeenCalledTimes(3);
  });

  it("모든 시도 실패 시 마지막 에러를 throw", async () => {
    const initFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail-1"))
      .mockRejectedValueOnce(new Error("fail-2"))
      .mockRejectedValueOnce(new Error("fail-3"));

    const promise = initializeNodeWithRetry(initFn);
    // catch를 미리 걸어서 unhandled rejection 방지
    const caught = promise.catch((e) => e);

    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);

    const error = await caught;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("fail-3");
    expect(initFn).toHaveBeenCalledTimes(3);
  });

  it("backoff 간격이 지수적으로 증가 (1s, 2s)", async () => {
    const timestamps: number[] = [];
    const initFn = vi.fn().mockImplementation(() => {
      timestamps.push(Date.now());
      return Promise.reject(new Error("fail"));
    });

    const promise = initializeNodeWithRetry(initFn).catch(() => {});

    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);
    await promise;

    expect(timestamps).toHaveLength(3);
    // 1번째 → 2번째: 1000ms
    expect(timestamps[1] - timestamps[0]).toBe(1000);
    // 2번째 → 3번째: 2000ms
    expect(timestamps[2] - timestamps[1]).toBe(2000);
  });
});

describe("PreloadEnded timeout", () => {
  it("5초 초과 시 false 반환", async () => {
    const slowRequest = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(true), 10000);
    });

    const result = await Promise.race([
      slowRequest,
      new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 5000),
      ),
    ]).catch(() => false);

    expect(result).toBe(false);
  });
});

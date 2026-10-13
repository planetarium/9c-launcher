import axios from "axios";
import { Planet } from "src/interfaces/registry";

/**
 * 엔드포인트 1개당 요청 전체(연결~응답 본문) 상한.
 * get-planetary-info IPC가 30초만 기다리므로 그보다 충분히 짧아야 한다.
 * (응답 없이 매달리는 외부 노드 하나 때문에 전체 초기화가 막히는 걸 방지)
 */
export const PLANET_CHECK_TIMEOUT_MS = 5_000;

const BOOTSTRAP_QUERY = `
  query {
    nodeStatus {
      bootstrapEnded
    }
  }
`;

export type EndpointProbe = (endpoint: string) => Promise<boolean>;

export const probeEndpoint = (
  endpoint: string,
  timeoutMs: number = PLANET_CHECK_TIMEOUT_MS,
): Promise<boolean> =>
  axios
    .post(
      endpoint,
      { query: BOOTSTRAP_QUERY },
      // axios timeout은 소켓 idle 기준이라 조금씩 흘리는 서버엔 뚫린다.
      // signal로 요청 전체에 hard deadline을 건다.
      { signal: AbortSignal.timeout(timeoutMs) },
    )
    .then(
      (response) => response.status === 200,
      () => false, // 요청 실패/타임아웃 시 false 반환
    );

/**
 * 엔드포인트 중 하나라도 응답하면 그 즉시 접근 가능으로 판정한다.
 * 느린 엔드포인트의 응답을 기다리지 않는다.
 */
async function isPlanetAccessible(
  planet: Planet,
  probe: EndpointProbe,
): Promise<boolean> {
  const endpoints = planet.rpcEndpoints["headless.gql"] ?? [];
  try {
    await Promise.any(
      endpoints.map(async (endpoint) => {
        if (!(await probe(endpoint))) {
          throw new Error(`${endpoint} is not accessible`);
        }
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export async function filterAccessiblePlanets(
  planets: Planet[],
  probe: EndpointProbe = probeEndpoint,
): Promise<Planet[]> {
  const results = await Promise.all(
    planets.map((planet) => isPlanetAccessible(planet, probe)),
  );
  return planets.filter((_, i) => results[i]);
}

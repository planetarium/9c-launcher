// S3에 올라간 마지막 APV 버전 넘버 가져오기
import { Parser } from "xml2js";
import https from "https";

const LIST_URL =
  "https://9c-test.s3.amazonaws.com/?list-type=2&prefix=v&delimiter=/";

function requestList(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    https
      .get(LIST_URL, (res) => {
        if (res.statusCode == null || res.statusCode >= 400) return res;
        res.setEncoding("utf8");
        let buffer = "";
        res.on("data", (chunk) => (buffer += chunk));
        res.on("end", () => resolve(buffer));
      })
      .on("error", reject);
  });
}

async function getMaxVersion(): Promise<number> {
  const resContent = await requestList();
  const xmlParser = new Parser();
  const listXml = await xmlParser.parseStringPromise(resContent);
  const versions: Array<number> = listXml.ListBucketResult.CommonPrefixes.map(
    (cp: any) => cp.Prefix[0]
  )
    .map((prefix: string) => prefix.match(/^v(\d+)\/$/))
    .filter((match: Array<string> | null) => match != null)
    .map((match: Array<string>) => parseInt(match[1]));
  return versions.sort((a, b) => b - a)[0];
}

async function main(): Promise<void> {
  console.debug(await getMaxVersion());
}

main().catch(console.error);

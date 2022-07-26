// Apply and save passed APV parameter to dist/config.json
import fs from "fs";
import path from "path";

async function configureApv(configPath: string, apv: string): Promise<void> {
  const configString = await fs.promises.readFile(configPath, "utf8");
  const config = (configString || "").trim() ? JSON.parse(configString) : {};
  config.AppProtocolVersion = apv;
  await fs.promises.writeFile(
    configPath,
    JSON.stringify(config, null, 2),
    "utf8"
  );
}

async function main(): Promise<void> {
  const argv = process.argv.slice();
  if (
    (path.basename(argv[0]) === "ts-node" ||
      argv[0].endsWith("\\ts-node\\dist\\bin.js")) &&
    path.basename(argv[1]) == path.basename(__filename)
  ) {
    argv.shift();
    argv[0] = "npm run configure-apv";
  }

  if (argv.length < 2) {
    console.error("usage:", argv[0], "APV");
    process.exit(1);
  }
  const configPath = path.join(path.dirname(__dirname), "dist", "config.json");
  const apv = argv[1].trim();
  await configureApv(configPath, apv);
}

main().catch(console.error);

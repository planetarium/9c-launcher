import { get } from "src/config";
import { version } from "package.json";

const { init } =
  process.type === "browser"
    ? require("@sentry/electron/dist/main")
    : require("@sentry/electron/dist/renderer");

const dsn =
  "https://5bd08f483a254487b7540c04898c8c8f@o195672.ingest.sentry.io/5289089";

export function initializeSentry() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Sentry is disabled in development mode.");
    return;
  }
  if (get("Sentry")) {
    console.debug("Sentry is enabled in production mode.");
    init({
      dsn: dsn,
      release: version,
    });
    return;
  }
  console.debug("Sentry is disabled by config");
}

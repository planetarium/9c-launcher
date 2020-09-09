import isDev from "electron-is-dev";

const { init } =
  process.type === "browser"
    ? require("@sentry/electron/dist/main")
    : require("@sentry/electron/dist/renderer");

const sentryDsn =
  "https://5bd08f483a254487b7540c04898c8c8f@o195672.ingest.sentry.io/5289089";

export default function initializeSentry() {
  if (isDev) {
    console.debug("Sentry is disabled in development mode.");
    return;
  }
  console.debug("Sentry is enabled in production mode.");
  init({
    dsn: sentryDsn,
    // debug: true,
  });
}

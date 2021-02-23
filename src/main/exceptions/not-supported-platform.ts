export class NotSupportedPlatformError extends Error {
  constructor(public platform: NodeJS.Platform) {
    super(`Not supported platform ${platform} was used.`);
  }
}

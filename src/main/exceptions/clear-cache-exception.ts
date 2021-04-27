export class ClearCacheException extends Error {
  constructor() {
    super(`Clear cache requested.`);
  }
}

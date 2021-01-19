class StandaloneExitedError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, StandaloneExitedError.prototype);
  }
}

export default StandaloneExitedError;

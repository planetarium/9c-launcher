class HeadlessExitedError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, HeadlessExitedError.prototype);
  }
}

export default HeadlessExitedError;

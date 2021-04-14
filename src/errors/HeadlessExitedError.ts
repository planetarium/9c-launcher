class HeadlessExitedError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export default HeadlessExitedError;

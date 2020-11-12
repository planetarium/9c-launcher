class StandaloneInitializeError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, StandaloneInitializeError.prototype);
  }
}

export default StandaloneInitializeError;

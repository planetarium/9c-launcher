class HeadlessInitializeError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, HeadlessInitializeError.prototype);
  }
}

export default HeadlessInitializeError;

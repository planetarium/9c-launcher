class HeadlessInitializeError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export default HeadlessInitializeError;

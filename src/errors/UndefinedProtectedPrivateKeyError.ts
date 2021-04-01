class UndefinedProtectedPrivateKeyError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, UndefinedProtectedPrivateKeyError.prototype);
  }
}

export default UndefinedProtectedPrivateKeyError;

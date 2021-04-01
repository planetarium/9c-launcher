class UndefinedProtectedPrivateKeyError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export default UndefinedProtectedPrivateKeyError;

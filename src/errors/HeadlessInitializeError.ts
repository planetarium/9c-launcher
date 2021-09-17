class HeadlessInitializeError extends Error {
  public cause: Error | null;

  constructor(msg: string, cause?: Error) {
    const message = `${msg} ${cause ? `caused by ${cause.message}` : ""}`;
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HeadlessInitializeError);
    }

    this.cause = cause ?? null;
  }
}

export default HeadlessInitializeError;

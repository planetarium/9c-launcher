class FetchError extends Error {
  constructor(msg: string, errCode: number) {
    super(msg);
    this.ErrCode = errCode;
    Object.setPrototypeOf(this, FetchError.prototype);
  }

  public ErrCode: number;
}

export default FetchError;

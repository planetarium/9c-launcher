class FetchError extends Error {
  constructor(msg: string, errCode: number) {
    super(msg);
    this.ErrCode = errCode;
  }

  public ErrCode: number;
}

export default FetchError;

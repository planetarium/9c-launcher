export interface BlockMetadata {
  ProtocolVersion: number;
  Index: number;
  Timestamp: string;
  Nonce: number[];
  Difficulty: number;
  TotalDifficulty: object;
  TxHash: number[] | [];
  Hash: number[];
  StateRootHash: number[];
  PreEvaluationHash: number[];
  BlockEpoch: number;
  TxEpoch: number;
  PreviousBlockEpoch: number;
  PreviousTxEpoch: number;
}

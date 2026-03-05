export interface BlockEntry {
  blockNumber: number;
  time: string;
  transactions: number;
  proposer: string;
  hash: string;
}

export interface TransactionEntry {
  hash: string;
  action: string;
  block: number;
  time: string;
  user: string;
}

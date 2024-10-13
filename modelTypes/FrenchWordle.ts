export enum FrenchWordStatus {
  Verified = 'Verified',
  Unverified = 'Unverified',
}

export type FrenchWord = {
  englishWord: string;
  frenchWord: string;
  status: FrenchWordStatus;
  isDeleted?: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

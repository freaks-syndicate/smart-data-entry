// Document interface. Read more at - https://mongoosejs.com/docs/typescript/schemas.html

import { IntFilterConstraint, PageInfo, StringFilterConstraint } from '../common/types';

// FIXME: Keeping receiptNumber required for POC and rest are optional
export interface IReceipt {
  uuid: string;
  receiptNumber: number;
  year?: number;
  date?: Date;
  mobileNumber?: number;
  name: string;
  address?: string;
  amount: number;
  aadharNumber?: number;
  panNumber?: string;
}

export interface IReceipts {
  results: IReceipt[];
  pageInfo: PageInfo;
}

export interface ICreateReceipt {
  receiptNumber: number;
  year?: number;
  date?: Date;
  mobileNumber?: number;
  name: string;
  address?: string;
  amount: number;
  aadharNumber?: number;
  panNumber?: string;
}

export interface IUpdateReceipt {
  receiptNumber?: number;
  year?: number;
  date?: Date;
  mobileNumber?: number;
  name?: string;
  address?: string;
  amount?: number;
  aadharNumber?: number;
  panNumber?: string;
}

export interface IDeleteReceipt {
  id: string;
}

export interface IWhereOptionsReceipt {
  id: StringFilterConstraint;
  uuid: StringFilterConstraint;
  receiptNumber: IntFilterConstraint;
}

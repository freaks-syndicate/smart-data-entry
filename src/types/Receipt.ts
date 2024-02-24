// Document interface. Read more at - https://mongoosejs.com/docs/typescript/schemas.html

import { IntFilterConstraint, PageInfo, StringFilterConstraint } from '../common/types';

export enum IdCode {
  AADHAR = 'Aadhar',
  PAN = 'PAN',
}

// FIXME: Keeping receiptNumber required for POC and rest are optional
export interface IReceipt {
  uuid: string;
  receiptNumber: number;
  financialYear?: string;
  date?: Date;
  mobileNumber?: string;
  name: string;
  address?: string;
  amount: number;
  aadharNumber?: string;
  panNumber?: string;
  idCode: IdCode;
}

export interface IReceipts {
  results: IReceipt[];
  pageInfo: PageInfo;
}

export interface ICreateReceipt {
  receiptNumber: number;
  financialYear?: string;
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
  financialYear?: string;
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
  address: StringFilterConstraint;
  receiptNumber: IntFilterConstraint;
  amount: IntFilterConstraint;
  idCode: StringFilterConstraint;
  financialYear: StringFilterConstraint;
}

// Document interface. Read more at - https://mongoosejs.com/docs/typescript/schemas.html

import { IntFilterConstraint, PageInfo, StringFilterConstraint } from '../common/types';

export enum IdCode {
  AADHAR = 'Aadhar',
  PAN = 'PAN',
}

export enum ModeOfPayment {
  CASH = 'cash',
  CHEQUE = 'cheque',
  ONLINE = 'online',
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
  modeOfPayment: ModeOfPayment;
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
  modeOfPayment: ModeOfPayment;
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
  modeOfPayment?: ModeOfPayment;
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
  modeOfPayment: StringFilterConstraint;
  idCode: StringFilterConstraint;
  financialYear: StringFilterConstraint;
}

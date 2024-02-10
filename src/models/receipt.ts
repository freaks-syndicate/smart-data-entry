import { model, Schema } from 'mongoose';

import { IReceipt } from '../types/Receipt';

const ReceiptSchema = new Schema<IReceipt>({
  uuid: { type: String, required: true },
  receiptNumber: { type: Number, required: true },
  year: { type: Number, required: false },
  date: { type: Date, required: false },
  mobileNumber: { type: Number, required: false },
  name: { type: String, required: true },
  address: { type: String, required: false },
  amount: { type: Number, required: true },
  aadharNumber: { type: Number, required: false },
  panNumber: { type: String, required: false },
});

export const ReceiptModel = model('Receipt', ReceiptSchema);

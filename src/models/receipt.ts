import { model, Schema } from 'mongoose';

import { IReceipt } from '../types/Receipt';

const indianMobileNumberPattern = /^[6-9]\d{9}$/;
const panNumberPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const ReceiptSchema = new Schema<IReceipt>({
  uuid: { type: String, required: true, unique: true },
  receiptNumber: { type: Number, required: true, unique: true },
  year: { type: Number, required: false },
  date: { type: Date, required: false },
  mobileNumber: {
    type: String,
    required: [false, 'Mobile number is required'],
    match: [indianMobileNumberPattern, 'Please enter a valid Indian mobile number'],
  },
  name: { type: String, required: [true, 'Name is required'] },
  address: { type: String, required: false },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount should be at least 1'],
  },
  aadharNumber: {
    type: String,
    required: false,
    validate: {
      validator: function (v) {
        // Aadhar number should be 12 digits
        return v == null || /^\d{12}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid Aadhar number!`,
    },
  },
  panNumber: {
    type: String,
    required: false,
    match: [panNumberPattern, 'Please enter a valid PAN number'],
  },
});

export const ReceiptModel = model('Receipt', ReceiptSchema);

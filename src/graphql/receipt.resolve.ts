import { ApolloError } from 'apollo-server-errors';

import { CreateArgs, DataStoreError, DeleteArgs, QueryArgs, UpdateArgs } from '../common/types';
import { CreateReceipt, IdCode, Receipt, Receipts, UpdateReceipt, WhereOptionsReceipt } from '../generated/graphql';
import { ReceiptModel } from '../models/receipt';
import { formatDataStoreError } from '../utils/formatDataStoreError';
import { parseWhereArgsToMongoQuery } from '../utils/graphql/parseMongoQuery';
import { withPageInfo } from '../utils/graphql/withPageInfo';
import { sanitize } from '../utils/stringUtils';
import { uuidFromString } from '../utils/uuid';

export const resolvers = {
  Query: {
    async ReceiptsAll(): Promise<Receipt[]> {
      return await ReceiptModel.find({});
    },
    async Receipts(parent: never, args: QueryArgs<Receipt, WhereOptionsReceipt>): Promise<Receipts> {
      const query = { ...args.where };
      const parsedQuery = parseWhereArgsToMongoQuery(query);

      const response = await ReceiptModel.find(parsedQuery);
      const countResponse = await ReceiptModel.countDocuments(parsedQuery);

      return withPageInfo(args, response, countResponse);
    },
    async Receipt(parent: never, args: QueryArgs<Receipt, WhereOptionsReceipt>): Promise<Receipt> {
      if (!args.where || Object.keys(args.where).length === 0) {
        throw new ApolloError('A "where" condition is required.', 'WHERE_CONDITION_REQUIRED');
      }

      const query = { ...args.where };

      return await ReceiptModel.findOne(parseWhereArgsToMongoQuery(query));
    },
  },
  Mutation: {
    async createReceipt(parent: never, args: CreateArgs<CreateReceipt>): Promise<Receipt> {
      const govtIdNumber = args.item.aadharNumber ?? args.item.panNumber;

      if (!govtIdNumber) {
        throw new ApolloError('Either aadharNumber or panNumber is required', 'VALIDATION_ERROR');
      }

      const idCode = args.item.aadharNumber ? IdCode.Aadhar : args.item.panNumber ? IdCode.Pan : null;

      const sanitizedName = sanitize(args.item.name + govtIdNumber.toString());
      const uuid = uuidFromString(ReceiptModel.name, sanitizedName);
      const { item } = args;

      const newReceipt = new ReceiptModel({
        ...item,
        uuid,
        idCode,
      });

      try {
        await newReceipt.save();
      } catch (error) {
        console.error(`Receipt.create description=[${sanitizedName}] uuid=[${uuid}]`, error);
        throw DataStoreError(formatDataStoreError(error, 'Error creating Receipt'));
      }

      return newReceipt;
    },
    async updateReceipt(parent: never, args: UpdateArgs<UpdateReceipt>): Promise<Receipt> {
      const { item, id } = args;

      try {
        const updatedReceipt = await ReceiptModel.findByIdAndUpdate(id, item, { new: true, runValidators: true });

        if (!updatedReceipt) {
          throw new ApolloError('Receipt not found', 'NOT_FOUND');
        }

        return updatedReceipt;
      } catch (error) {
        console.error(`Receipt.update [${id}]`, error);
        throw DataStoreError(formatDataStoreError(error, 'Error updating Receipt'));
      }
    },
    async deleteReceipt(parent: never, args: DeleteArgs<{ id: string }>): Promise<Receipt> {
      const { id } = args;

      try {
        const deletedReceipt = await ReceiptModel.findByIdAndDelete(id);

        if (!deletedReceipt) {
          throw new ApolloError('Receipt not found', 'NOT_FOUND');
        }

        return deletedReceipt;
      } catch (error) {
        console.error(`Receipt.delete [${id}]`, error);
        throw DataStoreError(formatDataStoreError(error, 'Error deleting Receipt'));
      }
    },
  },
};

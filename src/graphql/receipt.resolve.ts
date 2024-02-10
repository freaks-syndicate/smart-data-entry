import { ApolloError } from 'apollo-server-errors';

import { CreateArgs, DataStoreError, DeleteArgs, QueryArgs, UpdateArgs } from '../common/types';
import { ReceiptModel } from '../models/receipt';
import { ICreateReceipt, IDeleteReceipt, IReceipt, IReceipts, IUpdateReceipt, IWhereOptionsReceipt } from '../types/Receipt';
import { formatDataStoreError } from '../utils/formatDataStoreError';
import { parseMongoQuery } from '../utils/graphql/parseMongoQuery';
import { withPageInfo } from '../utils/graphql/withPageInfo';
import { sanitize } from '../utils/stringUtils';
import { uuidFromString } from '../utils/uuid';

export const resolvers = {
  Query: {
    async ReceiptsAll(): Promise<IReceipt[]> {
      return await ReceiptModel.find({});
    },
    async Receipts(parent: never, args: QueryArgs<IReceipt, IWhereOptionsReceipt>): Promise<IReceipts> {
      const query = { ...args.where };
      const response = await ReceiptModel.find(query);
      const countResponse = await ReceiptModel.countDocuments(query);
      return withPageInfo(args, response, countResponse);
    },
    async Receipt(parent: never, args: QueryArgs<IReceipt, IWhereOptionsReceipt>): Promise<IReceipt> {
      const query = { ...args.where };
      return await ReceiptModel.findOne(parseMongoQuery(query));
    },
  },
  Mutation: {
    async createReceipt(parent: never, args: CreateArgs<ICreateReceipt>): Promise<IReceipt> {
      const govtIdNumber = args.item.aadharNumber ?? args.item.panNumber;

      if (!govtIdNumber) {
        throw new ApolloError('Either aadharNumber or panNumber is required', 'VALIDATION_ERROR');
      }

      const sanitizedName = sanitize(args.item.name + govtIdNumber.toString());
      const uuid = uuidFromString(ReceiptModel.name, sanitizedName);
      const { item } = args;

      const newReceipt = new ReceiptModel({
        uuid,
        ...item,
      });

      try {
        await newReceipt.save();
      } catch (error) {
        console.error(`Receipt.create description=[${sanitizedName}] uuid=[${uuid}]`, error);
        throw DataStoreError(formatDataStoreError(error, 'Error creating Receipt'));
      }

      return newReceipt;
    },
    async updateReceipt(parent: never, args: UpdateArgs<IUpdateReceipt>): Promise<IReceipt> {
      const { item, id } = args;

      try {
        const result = await ReceiptModel.findByIdAndUpdate(id, item);
        return result;
      } catch (error) {
        console.error(`Receipt.update [${id}]`, error);
        throw DataStoreError(formatDataStoreError(error, 'Error updating Receipt'));
      }
    },
    async deleteReceipt(parent: never, args: DeleteArgs<IDeleteReceipt>): Promise<IReceipt> {
      const { id } = args;

      try {
        const deletedReceipt = await ReceiptModel.findByIdAndDelete(id);
        return deletedReceipt;
      } catch (error) {
        console.error(`Receipt.delete [${id}]`, error);
        throw DataStoreError(formatDataStoreError(error, 'Error deleting Receipt'));
      }
    },
  },
};
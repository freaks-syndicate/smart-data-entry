import { ApolloError } from 'apollo-server-errors';

import { CreateArgs, DataStoreError, DeleteArgs, ForbiddenError, QueryArgs, UpdateArgs } from '../common/types';
import { ReceiptBook, WhereOptionsReceiptBook } from '../generated/graphql';
import { ReceiptBookModel } from '../models/receipt_book';
import { formatDataStoreError } from '../utils/formatDataStoreError';
import { parseWhereArgsToMongoQuery } from '../utils/graphql/parseMongoQuery';
import { withPageInfo } from '../utils/graphql/withPageInfo';
import { sanitize } from '../utils/stringUtils';
import { uuidFromString } from '../utils/uuid';
import { GraphQLRequestContextWithAuth } from './../../dist/src/common/types.d';
import { CreateReceiptBook, ReceiptBooks, UpdateReceiptBook } from './../generated/graphql';

export const resolvers = {
  Query: {
    async ReceiptBooksAll(): Promise<ReceiptBook[]> {
      return await ReceiptBookModel.find({});
    },
    async ReceiptBooks(parent: never, args: QueryArgs<ReceiptBook, WhereOptionsReceiptBook>): Promise<ReceiptBooks> {
      const query = { ...args.where };
      const parsedQuery = parseWhereArgsToMongoQuery(query);

      const response = await ReceiptBookModel.find(parsedQuery);
      const countResponse = await ReceiptBookModel.countDocuments(parsedQuery);

      return withPageInfo(args, response, countResponse);
    },
    async ReceiptBook(parent: never, args: QueryArgs<ReceiptBook, WhereOptionsReceiptBook>): Promise<ReceiptBook> {
      if (!args.where || Object.keys(args.where).length === 0) {
        throw new ApolloError('A "where" condition is required.', 'WHERE_CONDITION_REQUIRED');
      }

      const query = { ...args.where };

      return await ReceiptBookModel.findOne(parseWhereArgsToMongoQuery(query));
    },
  },
  Mutation: {
    async createReceiptBook(
      parent: never,
      args: CreateArgs<CreateReceiptBook>,
      context: GraphQLRequestContextWithAuth,
    ): Promise<ReceiptBook> {
      if (!context.auth.canMutate) {
        throw ForbiddenError('Unauthorized');
      }
      if (!context.auth.authData.userRoles.includes('admin')) {
        throw new ApolloError('You must be an Admin to create a Receipt Book ', 'UNAUTHORIZED');
      }
      if (!args.item || Object.keys(args.item).length === 0) {
        throw new ApolloError('An "item" CreateReceiptBook object is required.', 'CREATE_ARGS_REQUIRED');
      }

      const sanitizedName = sanitize(ReceiptBookModel.name + args.item.receiptBookNumber);
      const uuid = uuidFromString(ReceiptBookModel.name, sanitizedName);
      const { item } = args;

      const newReceiptBook = new ReceiptBookModel({
        ...item,
        uuid,
      });

      try {
        await newReceiptBook.save();
      } catch (error) {
        console.error(`ReceiptBook.create description=[${sanitizedName}] uuid=[${uuid}]`, error);
        throw DataStoreError(formatDataStoreError(error, 'Error creating ReceiptBook'));
      }

      return newReceiptBook;
    },
    async updateReceiptBook(
      parent: never,
      args: UpdateArgs<UpdateReceiptBook>,
      context: GraphQLRequestContextWithAuth,
    ): Promise<ReceiptBook> {
      if (!context.auth.canMutate) {
        throw ForbiddenError('Unauthorized');
      }
      if (!context.auth.authData.userRoles.includes('admin')) {
        throw new ApolloError('You must be an Admin to update a Receipt Book ', 'UNAUTHORIZED');
      }
      if (!args.item || Object.keys(args.item).length === 0) {
        throw new ApolloError('An "item" UpdateReceiptBook object is required.', 'UPDATE_ARGS_REQUIRED');
      }

      const { item, id } = args;

      try {
        const updatedReceipt = await ReceiptBookModel.findByIdAndUpdate(id, item, { new: true, runValidators: true });

        if (!updatedReceipt) {
          throw new ApolloError('ReceiptBook not found', 'NOT_FOUND');
        }

        return updatedReceipt;
      } catch (error) {
        console.error(`ReceiptBook.update [${id}]`, error);
        throw DataStoreError(formatDataStoreError(error, 'Error updating ReceiptBook'));
      }
    },
    async deleteReceipt(parent: never, args: DeleteArgs<{ id: string }>, context: GraphQLRequestContextWithAuth): Promise<ReceiptBook> {
      if (!context.auth.canMutate) {
        throw ForbiddenError('Unauthorized');
      }
      if (!context.auth.authData.userRoles.includes('admin')) {
        throw new ApolloError('You must be an Admin to update a Receipt Book ', 'UNAUTHORIZED');
      }
      if (!args.id) {
        throw new ApolloError('An "id" is required to delete.', 'DELETE_ARGS_REQUIRED');
      }

      const { id } = args;

      try {
        const deletedReceipt = await ReceiptBookModel.findByIdAndDelete(id);

        if (!deletedReceipt) {
          throw new ApolloError('ReceiptBook not found', 'NOT_FOUND');
        }

        return deletedReceipt;
      } catch (error) {
        console.error(`ReceiptBook.delete [${id}]`, error);
        throw DataStoreError(formatDataStoreError(error, 'Error deleting ReceiptBook'));
      }
    },
  },
};
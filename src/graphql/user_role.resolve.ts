import { ApolloError } from 'apollo-server-errors';
import UserRoles from 'supertokens-node/recipe/userroles';

import { CreateArgs, DataStoreError, QueryArgs } from '../common/types';
import { AssignUserRole, CreateUserRole, RemoveUserRole, UserRole, WhereOptionsUserRole } from '../generated/graphql';
import { formatDataStoreError } from '../utils/formatDataStoreError';

export const resolvers = {
  Query: {
    async UserRolesAll(): Promise<UserRole[]> {
      const data = await UserRoles.getAllRoles();
      const roles = data.roles.map((role) => ({ name: role, permissions: [] }));
      return roles;
    },
    async UserRole(parent: never, args: QueryArgs<UserRole, WhereOptionsUserRole>): Promise<UserRole> {
      if (!args.where || Object.keys(args.where).length === 0) {
        throw new ApolloError('A "where" condition is required.', 'WHERE_CONDITION_REQUIRED');
      }

      const roleName = args.where.name;
      const data = await UserRoles.getPermissionsForRole(roleName);
      let role: UserRole;
      if (data.status === 'OK') {
        role = { name: roleName, permissions: data.permissions };
        return role;
      }

      throw new ApolloError('Unknown role', 'UNKNOWN_ROLE_ERROR');
    },
  },
  Mutation: {
    async createUserRole(parent: never, args: CreateArgs<CreateUserRole>): Promise<boolean> {
      if (!args.item || Object.keys(args.item).length === 0) {
        throw new ApolloError('An "item" CreateUserRole object is required.', 'CREATE_ARGS_REQUIRED');
      }

      const { name: roleName, permissions } = args.item;

      try {
        const response = await UserRoles.createNewRoleOrAddPermissions(roleName, permissions);

        if (response.createdNewRole === false) {
          throw new ApolloError(`A role with name ${roleName} already exists!`, 'ROLE_EXISTS_ERROR');
        }

        return response.createdNewRole;
      } catch (error) {
        console.error(`UserRole.create roleName=[${roleName}]`, error);
        throw DataStoreError(formatDataStoreError(error, 'Error creating UserRole'));
      }
    },
    async deleteUserRole(parent: never, args: { name: string }): Promise<boolean> {
      if (!args.name) {
        throw new ApolloError('A Role Name is required.', 'DELETE_ARGS_REQUIRED');
      }
      const { name: roleName } = args;

      try {
        const response = await UserRoles.deleteRole(roleName);

        if (!response.didRoleExist) {
          throw new ApolloError(`Role ${roleName} does not exist!`, 'ROLE_EXISTS_ERROR');
        }

        return response.didRoleExist;
      } catch (error) {
        console.error(`UserRole.delete [${roleName}]`, error);
        throw DataStoreError(formatDataStoreError(error, 'Error deleting Receipt'));
      }
    },
    async assignRoleToUser(parent: never, args: { item: AssignUserRole }): Promise<boolean> {
      if (!args.item || Object.keys(args.item).length === 0) {
        throw new ApolloError('An "item" AssignUserRole object is required.', 'ASSIGN_USER_ROLE_ARGS_REQUIRED');
      }

      const { roleName, userId } = args.item;

      try {
        const response = await UserRoles.addRoleToUser('public', userId, roleName);

        if (response.status === 'UNKNOWN_ROLE_ERROR') {
          throw new ApolloError(`Role ${roleName} does not exist!`, 'ROLE_EXISTS_ERROR');
        }

        if (response.didUserAlreadyHaveRole === true) {
          throw new ApolloError(`User ${userId} already had the role ${roleName}!`, 'ROLE_EXISTS_ERROR');
        }

        return response.status === 'OK';
      } catch (error) {
        console.error(`UserRole.assignRoleToUser roleName=[${roleName}]`, error);
        throw DataStoreError(formatDataStoreError(error, 'Error creating UserRole'));
      }
    },
    async removeRoleFromUser(parent: never, args: { item: RemoveUserRole }): Promise<boolean> {
      if (!args.item || Object.keys(args.item).length === 0) {
        throw new ApolloError('An "item" RemoveUserRole object is required.', 'REMOVE_USER_ROLE_ARGS_REQUIRED');
      }

      const { roleName, userId } = args.item;

      try {
        const response = await UserRoles.removeUserRole('public', userId, roleName);

        if (response.status === 'UNKNOWN_ROLE_ERROR') {
          throw new ApolloError(`Role ${roleName} does not exist!`, 'ROLE_EXISTS_ERROR');
        }

        if (response.didUserHaveRole === false) {
          throw new ApolloError(`User ${userId} was never assigned the role ${roleName}!`, 'ROLE_EXISTS_ERROR');
        }

        return response.status === 'OK';
      } catch (error) {
        console.error(`UserRole.removeRoleFromUser roleName=[${roleName}]`, error);
        throw DataStoreError(formatDataStoreError(error, 'Error creating UserRole'));
      }
    },
  },
};

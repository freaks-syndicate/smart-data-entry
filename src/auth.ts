import { Response } from 'express';
import { SessionRequest } from 'supertokens-node/framework/express';
import Session from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';
import { v4 as uuidv4 } from 'uuid';

import { AuthContext, GraphQLRequestContextWithAuth } from './common/types';
import { logger } from './logger';

export const context = async ({ req, res }: { req: SessionRequest; res: Response }) => {
  const auth: AuthContext = {
    isAnonymous: true,
    canQuery: true,
    canIntrospect: false,
    canMutate: false,
    permissions: {
      read_all: true,
      delete_all: false,
      delete_self: false,
      edit_all: false,
      edit_self: false,
    },
    authData: {},
  };

  try {
    const session = await Session.getSession(req, res, {
      sessionRequired: false,
    });
    if (session) {
      auth.authData.userId = session.getUserId();
      auth.authData.userDataInAccessToken = session.getAccessTokenPayload();

      const roles = await req.session.getClaimValue(UserRoles.UserRoleClaim);
      auth.authData.userRoles = roles;

      // Fetch permissions and set the permissions in context
      const permissions = await req.session.getClaimValue(UserRoles.PermissionClaim);

      if (permissions.includes('delete:all')) {
        auth.permissions.delete_all = true;
      }
      if (permissions.includes('delete:self')) {
        auth.permissions.delete_self = true;
      }
      if (permissions.includes('edit:all')) {
        auth.permissions.edit_all = true;
      }
      if (permissions.includes('edit:self')) {
        auth.permissions.edit_self = true;
      }
    }
  } catch (error) {
    console.error(error);
  }

  const requestId = req.headers?.['gcdn-request-id'] ?? uuidv4();
  const requestLogger = logger.child({ requestId });
  return {
    auth,
    requestId,
    logger: requestLogger,
  };
};

// Helper function to check if the user has the admin role
export const isAdmin = (context: GraphQLRequestContextWithAuth) => context.auth.authData.userRoles.includes('admin');

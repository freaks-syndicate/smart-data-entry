import SuperTokens from 'supertokens-node';
import { TypeInput } from 'supertokens-node/lib/build/types';
import Dashboard from 'supertokens-node/recipe/dashboard';
import Session from 'supertokens-node/recipe/session';
import ThirdPartyEmailPassword from 'supertokens-node/recipe/thirdpartyemailpassword';
import UserRoles from 'supertokens-node/recipe/userroles';

import { SUPERTOKENS_API_DOMAIN, SUPERTOKENS_API_KEY, SUPERTOKENS_APP_DOMAIN, SUPERTOKENS_CONNECTION_URI } from '../../constants';

export const backendConfig = (): TypeInput => ({
  framework: 'express',
  supertokens: {
    connectionURI: SUPERTOKENS_CONNECTION_URI,
    apiKey: SUPERTOKENS_API_KEY,
  },
  appInfo: {
    // learn more about this on https://supertokens.com/docs/thirdpartyemailpassword/appinfo
    appName: 'Smart Data Entry',
    apiDomain: SUPERTOKENS_API_DOMAIN,
    websiteDomain: SUPERTOKENS_APP_DOMAIN,
    apiBasePath: '/auth',
    websiteBasePath: '/auth',
  },
  recipeList: [
    ThirdPartyEmailPassword.init({
      // IMPORTANT: Please replace them with your own OAuth keys for production use.
      providers: [
        {
          config: {
            thirdPartyId: 'google',
            clients: [
              {
                clientId: '1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com',
                clientSecret: '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',
              },
            ],
          },
        },
        {
          config: {
            thirdPartyId: 'github',
            clients: [
              {
                clientId: '467101b197249757c71f',
                clientSecret: 'e97051221f4b6426e8fe8d51486396703012f5bd',
              },
            ],
          },
        },
        {
          config: {
            thirdPartyId: 'apple',
            clients: [
              {
                clientId: '4398792-io.supertokens.example.service',
                additionalConfig: {
                  keyId: '7M48Y4RYDL',
                  privateKey:
                    '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgu8gXs+XYkqXD6Ala9Sf/iJXzhbwcoG5dMh1OonpdJUmgCgYIKoZIzj0DAQehRANCAASfrvlFbFCYqn3I2zeknYXLwtH30JuOKestDbSfZYxZNMqhF/OzdZFTV0zc5u5s3eN+oCWbnvl0hM+9IW0UlkdA\n-----END PRIVATE KEY-----',
                  teamId: 'YWQCXGJRJL',
                },
              },
            ],
          },
        },
      ],
    }),
    Dashboard.init(),
    Session.init(),
    UserRoles.init(),
  ],
});

let initialized = false;
export function ensureSuperTokensInit() {
  if (!initialized) {
    SuperTokens.init(backendConfig());
    initialized = true;
  }
}

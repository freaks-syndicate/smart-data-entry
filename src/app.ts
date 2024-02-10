import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginUsageReportingDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import cors from 'cors';
import express from 'express';
import robots from 'express-robots-txt';
import http from 'http';

import { APP_PORT, DEPLOY_ENV } from './constants';
import { connectToMongo } from './database';
import { gqlModules, scalars } from './graphql/all.types';
import { logger } from './logger';
import { errorLogPlugin } from './plugins/apolloErrorLogging';
import typeDefs from './schema.graphql';

const app = express();
const isProd = DEPLOY_ENV == 'prod';
const httpServer = http.createServer(app);

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(robots({ UserAgent: '*', Disallow: '/' }));
app.use(cors());

const playgroundPlugin = isProd
  ? ApolloServerPluginLandingPageProductionDefault()
  : ApolloServerPluginLandingPageLocalDefault({ footer: false });

const server = new ApolloServer({
  introspection: true, // Managed by restrictIntrospectionPlugin, x-api-key must be set
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ApolloServerPluginUsageReportingDisabled(),
    errorLogPlugin,
    playgroundPlugin,
  ],
  formatError: (formattedError, error) => {
    if (formattedError?.extensions?.code) {
      const code = formattedError.extensions.code;
      switch (code) {
        case 'UNAUTHENTICATED':
          return {
            message: 'Expired or invalid Authorization',
            extensions: {
              ...(formattedError.extensions ?? {}),
              code: 'UNAUTHENTICATED',
            },
          };
        case 'INTROSPECTION_RESTRICTED':
          return formattedError;
        default:
          logger.error({ ...formattedError, stack: error?.['stack'] ?? null });
          return formattedError;
      }
    }

    const isSequelize = error?.['stack']?.indexOf(/query\.run/gi);
    if (isSequelize) {
      logger.error(formattedError, error);
      return {
        extensions: { code: 'DATA_STORE_ERROR' },
        message: 'Data store error',
      };
    }
    return formattedError;
  },
  typeDefs: typeDefs,
  resolvers: gqlModules.map((m) => m.resolvers).concat(scalars),
});

await server.start();

connectToMongo();

app.use('/graphql', cors<cors.CorsRequest>(), express.json(), expressMiddleware(server));

await new Promise<void>((resolve) => {
  const s = httpServer.listen({ port: APP_PORT }, resolve);
  s.keepAliveTimeout = 29000;
  s.headersTimeout = 30000;
});

logger.info(`🚀 Server ready at http://localhost:${APP_PORT}`);

app.get('/health-check', (req, res) => {
  res.status(200).send('OK');
});

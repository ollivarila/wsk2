import {MyContext} from '../interfaces/MyContext';
// import {createRateLimitRule} from 'graphql-rate-limit';
// import {shield} from 'graphql-shield';
// import {makeExecutableSchema} from '@graphql-tools/schema';
// import {ApolloServer} from '@apollo/server';
import {ApolloServer} from '@apollo/server';
import typeDefs from './schemas';
import resolvers from './resolvers';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import {expressMiddleware} from '@apollo/server/express4';
import authenticate from '../functions/authenticate';
import {makeExecutableSchema} from '@graphql-tools/schema';
import {createRateLimitRule} from 'graphql-rate-limit';
import {shield} from 'graphql-shield';
import {applyMiddleware} from 'graphql-middleware';

const rateLimitRule = createRateLimitRule({
  identifyContext: (ctx) => ctx.id,
});

const permissions = shield({
  Query: {
    '*': rateLimitRule({window: '30s', max: 5}),
  },
  Mutation: {
    '*': rateLimitRule({window: '30s', max: 5}),
  },
});

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const schemaWithRateLimit = applyMiddleware(schema, permissions);

export default async function createServerMiddleware() {
  const server = new ApolloServer<MyContext>({
    schema: schemaWithRateLimit,
    introspection: true,
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault({
            embed: true as false,
          })
        : ApolloServerPluginLandingPageLocalDefault(),
    ],
    includeStacktraceInErrorResponses: false,
  });
  await server.start();
  console.log('Apollo server started');
  return expressMiddleware(server, {
    context: async ({req}) => {
      const userIdWithToken = authenticate(req);
      return {
        userIdWithToken,
      };
    },
  });
}

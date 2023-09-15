import catResolver from './catResolver';
import userResolver from './userResolver';
import {GraphQLScalarType, Kind} from 'graphql';

export interface GetByIdArgs {
  id: string;
}

const dateScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date custom scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return value.toJSON(); // Convert outgoing Date to integer for JSON
    }
    throw Error('GraphQL Date Scalar serializer expected a `Date` object');
  },
  parseValue(value) {
    if (typeof value === 'number') {
      return new Date(value); // Convert incoming integer to Date
    }

    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('GraphQL Date Scalar parser expected a `number`');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      // Convert hard-coded AST string to integer and then to Date
      return new Date(parseInt(ast.value, 10));
    }
    // Invalid hard-coded value (not an integer)
    return null;
  },
});

const dateResolver = {
  DateTime: dateScalar,
};

export default [catResolver, userResolver, dateResolver];

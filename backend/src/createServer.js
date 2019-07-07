const { GraphQLServer } = require('graphql-yoga')
const Mutation = require('./resolvers/Mutation')
const Query = require('./resolvers/Query')
const { prisma } = require('./generated/prisma-client')

// creating GraphQL Yoga server
function createServer () {
  return new GraphQLServer({
    typeDefs: 'src/schema.graphql',
    resolvers: {
      Mutation,
      Query,
      // type resolver
      // https://www.prisma.io/tutorials/a-guide-to-common-resolver-patterns-ct08/#scenario-implementing-relations-with-prisma-client
      User: {
        cart(parent) {
          return prisma.user({ id: parent.id }).cart()
        },
      },
      CartItem: {
        item(parent) {
          return prisma.cartItem({ id: parent.id }).item()
        }
      }
    },
    resolverValidationOptions: {
      requireResolversForResolveType: false
    },
    context: req => ({ ...req, prisma })
  })
}

module.exports = createServer;

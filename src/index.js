const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = require('./resolvers')


const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen({port: 9955}).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "http://localhost:8080/graphql",
});

const linearLink = createHttpLink({
  uri: "https://api.linear.app/graphql",
});

const authLink = setContext((_, { headers }) => {
  // Access the token based on the specific context of the operation
  const token = localStorage.getItem("token");
  console.log("Token for Auth Link:", token);

  // Set the appropriate headers
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const link = createHttpLink({
  uri: (operation) =>
    operation.getContext().useLinearApi
      ? "https://api.linear.app/graphql"
      : "http://localhost:8080/graphql",
  fetchOptions: {
    method: "POST",
  },
});

const client = new ApolloClient({
  link: authLink.concat(link),
  cache: new InMemoryCache(),
});

export default client;

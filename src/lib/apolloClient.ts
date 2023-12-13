import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  gql,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

import { makeVar } from "@apollo/client";

const authLink = setContext((_, { headers }) => {
  const token: string | null = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(
  ({ graphQLErrors, networkError, forward, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        if (message.includes("Invalid or expired token")) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else if (extensions?.code === "FORBIDDEN") {
          isForbiddenVar(true); // Update the reactive variable on forbidden error
        }
      });
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
    return forward(operation);
  }
);

export const isForbiddenVar = makeVar(false);

const client = new ApolloClient({
  link: from([
    errorLink,
    authLink,
    createHttpLink({
      uri: (operation) =>
        operation.getContext().useLinearApi
          ? "https://api.linear.app/graphql"
          : "http://localhost:8080/graphql",
      fetchOptions: {
        method: "POST",
      },
    }),
  ]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          isForbidden: {
            read() {
              return isForbiddenVar();
            },
          },
        },
      },
    },
  }),
});

export default client;

export const logout = () => {
  localStorage.removeItem("token");
  client.resetStore();
  window.location.href = "/login";
};

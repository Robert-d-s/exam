// import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
// import { setContext } from "@apollo/client/link/context";

// const httpLink = createHttpLink({
//   uri: "http://localhost:8080/graphql",
// });

// // console.log("Before setContext");
// const authLink = setContext((_, { headers }) => {
//   // console.log("Inside setContext");
//   // get the authentication token from local storage if it exists
//   const token = localStorage.getItem("token");
//   // return the headers to the context so httpLink can read them
//   // console.log(token);
//   const newHeaders = {
//     ...headers,
//     authorization: token ? `Bearer ${token}` : "",
//   };
//   // console.log(newHeaders);
//   return { headers: newHeaders };
// });

// // console.log("After setContext");

// const client = new ApolloClient({
//   link: authLink.concat(httpLink), // Chain it with the HttpLink
//   cache: new InMemoryCache(),
// });

// export default client;

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

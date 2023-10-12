import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "http://localhost:8080/graphql",
});

console.log("Before setContext");
const authLink = setContext((_, { headers }) => {
  console.log("Inside setContext");
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("token");
  // return the headers to the context so httpLink can read them
  console.log(token);
  const newHeaders = {
    ...headers,
    authorization: token ? `Bearer ${token}` : "",
  };
  console.log(newHeaders); // <-- Add this line to log the headers
  return { headers: newHeaders };
});

console.log("After setContext");

const client = new ApolloClient({
  link: authLink.concat(httpLink), // Chain it with the HttpLink
  cache: new InMemoryCache(),
});

export default client;

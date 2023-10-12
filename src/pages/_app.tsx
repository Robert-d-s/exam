// import "@/styles/globals.css";
// import type { AppProps } from "next/app";

// export default function App({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />;
// }

// import { ApolloClient, InMemoryCache } from "@apollo/client";
import client from "../lib/apolloClient";
import { ApolloProvider } from "@apollo/client/react";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

// const client = new ApolloClient({
//   uri: "http://localhost:8080/graphql",
//   cache: new InMemoryCache(),
// });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

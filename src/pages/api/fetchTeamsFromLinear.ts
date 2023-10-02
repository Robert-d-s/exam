import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization?.split(" ")[1] || ""; // Extract JWT token from incoming header

  // Define your GraphQL query
  const query = `
    query {
      fetchTeamsFromLinear {
        nodes {
          id
          name
          createdAt
          timezone
          members {
            id
            name
          }
        }
      }
    }
  `;

  try {
    const backendResponse = await fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }), // Sending the query in the request body
    });

    const data = await backendResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error while fetching from backend:", error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
}

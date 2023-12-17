import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization?.split(" ")[1] || "";

  // Define the GraphQL query for organization data
  const query = `
    query getorganization {
      getorganization {
        id
        createdAt
        updatedAt
        name
        users {
          nodes {
            id
            createdAt
            updatedAt
            name
            displayName
            email
            avatarUrl
            lastSeen
            teams {
              nodes {
                id
                createdAt
                updatedAt
                name
                key
                description
              }
            }
          }
        }
      }
    }
  `;

  try {
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await backendResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error while fetching organization data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching organization data" });
  }
}

import React, { useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
// import gql from "graphql-tag";

interface User {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  createdAt: string;
  timezone: string;
  members: User[];
}

const FETCH_TEAMS = gql`
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

const TeamSyncAndFetch: React.FC = () => {
  const { loading, error, data } = useQuery(FETCH_TEAMS);

  const syncTeams = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:8080/team-synchronize/teams",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      const responseData = await response.json();
      console.log("Sync Response:", responseData);
    } catch (error) {
      console.error("Error during sync:", error);
    }
  };

  useEffect(() => {
    syncTeams();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Team Synchronization</h1>
      <p>Check the console for synchronization results.</p>
      <h1>Teams</h1>
      {data.fetchTeamsFromLinear.nodes.map((team: Team) => (
        <div key={team.id}>
          <h3>{team.name}</h3>
          <p>ID: {team.id}</p>
          <p>Created At: {team.createdAt}</p>
          <p>Timezone: {team.timezone}</p>
          <h4>Members</h4>
          <ul>
            {team.members.map((member: User) => (
              <li key={member.id}>
                {member.name} (ID: {member.id})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default TeamSyncAndFetch;

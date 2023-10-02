import React, { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  members: {
    nodes: User[];
  };
}

interface TeamsResponse {
  data: {
    teams: {
      nodes: Team[];
    };
  };
}

const TeamFetchTest: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  // const organizationID = "58cc4093-54ae-4b2e-ac84-f626159d164f";

  const fetchTeams = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    const query = `
    query {
      teams {
        nodes {
          id
          name
          createdAt
          timezone
          members {
            nodes {
              id
              name
            }
          }
        }
      }
    }
    
    `;

    try {
      const response = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${personalApiKey}`,
        },
        body: JSON.stringify({ query }),
      });

      console.log("Response:", response);

      const data: TeamsResponse = await response.json();

      if (!response.ok) {
        console.error("Server responded with an error:", data);
        return;
      }

      console.log(data.data.teams.nodes);

      if (data && data.data && data.data.teams) {
        setTeams(data.data.teams.nodes);
      } else {
        console.error("Unexpected data structure", data);
      }
    } catch (error) {
      console.error("An error occurred while fetching data:", error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div>
      <h1>Teams</h1>
      {teams.map((team, teamIndex) => (
        <div key={teamIndex}>
          <h3>{team.name}</h3>
          <p>ID: {team.id}</p>
          <h4>Members</h4>
          <ul>
            {team.members.nodes.map((member, memberIndex) => (
              <li key={memberIndex}>
                {member.name} (ID: {member.id})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default TeamFetchTest;

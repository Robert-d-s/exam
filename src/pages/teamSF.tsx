import React, { useState, useEffect } from "react";

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

// This interface should be in line with how your server sends the data
interface FetchTeamsFromLinearResponse {
  data: {
    fetchTeamsFromLinear: {
      nodes: Team[];
    };
  };
}

const TeamFetchTest: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);

  const fetchTeams = async () => {
    try {
      // Use JWT token from local storage
      const token = localStorage.getItem("token");

      // Make a request to your own backend
      const response = await fetch("/api/fetchTeamsFromLinear", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: FetchTeamsFromLinearResponse = await response.json();

      if (data && data.data && data.data.fetchTeamsFromLinear) {
        setTeams(data.data.fetchTeamsFromLinear.nodes);
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
      {teams.map((team) => (
        <div key={team.id}>
          <h3>{team.name}</h3>
          <p>ID: {team.id}</p>
          <p>Created At: {team.createdAt}</p>
          <p>Timezone: {team.timezone}</p>
          <h4>Members</h4>
          <ul>
            {team.members.map((member) => (
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

export default TeamFetchTest;

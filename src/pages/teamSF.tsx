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

interface FetchTeamsFromLinearResponse {
  data: {
    fetchTeamsFromLinear: {
      nodes: Team[];
    };
  };
}

const TeamSyncAndFetch: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);

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

      const data = await response.json();
      console.log("Sync Response:", data);
    } catch (error) {
      console.error("Error during sync:", error);
    }
  };

  const fetchTeams = async () => {
    const token = localStorage.getItem("token");

    try {
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
    const fetchDataAndSync = async () => {
      await syncTeams();
      await fetchTeams();
    };

    fetchDataAndSync();
  }, []);

  return (
    <div>
      <h1>Team Synchronization</h1>
      <p>Check the console for synchronization results.</p>
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

export default TeamSyncAndFetch;

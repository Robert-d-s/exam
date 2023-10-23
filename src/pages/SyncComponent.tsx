import React, { useEffect } from "react";

const SyncComponent: React.FC = () => {
  useEffect(() => {
    const syncTeams = async () => {
      // Retrieve the token from local storage
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          "http://localhost:8080/team-synchronize/teams",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // Add Authorization header if a token is present
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

    syncTeams();
  }, []);

  return (
    <div>
      <h1>Team Synchronization</h1>
      <p>Check the console for synchronization results.</p>
    </div>
  );
};

export default SyncComponent;

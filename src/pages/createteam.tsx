import React, { useState, FC } from "react";

const CreateTeam: FC = () => {
  const [name, setName] = useState<string>("");

  const handleCreateTeam = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
              mutation CreateTeam($name: String!) {
                createTeam(name: $name) {
                  id
                  name
                  projects {
                    id
                    name
                  }
                  rates {
                    id
                    name
                    rate
                  }
                }
              }
            `,
          variables: {
            name,
          },
        }),
      });
      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Server Response:", data);
      //   if (data && data.createTeam && data.createTeam.id) {
      if (
        data &&
        data.createTeam &&
        data.createTeam.id &&
        typeof data.createTeam.id === "string"
      ) {
        alert("Team created successfully!");
        setName(""); // Reset the input field
      } else if (data.errors && data.errors.length > 0) {
        alert(`Error: ${data.errors[0].message}`);
      } else {
        alert("An unexpected error occurred.");
      }
    } catch (error: any) {
      alert(
        `Network error: ${error.message || "Cannot connect to the server."}`
      );
    }
  };

  return (
    <div>
      <h2>Create Team</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Team Name"
      />
      <button onClick={handleCreateTeam}>Create</button>
    </div>
  );
};

export default CreateTeam;

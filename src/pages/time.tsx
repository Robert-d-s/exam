import React, { useEffect, useState } from "react";

const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

type User = {
  id: string;
  name: string;
  email: string;
};

type Project = {
  id: string;
  name: string;
};

const TotalTimeSpent: React.FC = () => {
  const [totalTime, setTotalTime] = useState(0);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(getCurrentDate());
  const [endDate, setEndDate] = useState(getCurrentDate());

  // Fetch userId and projectId when component mounts
  // Fetch all users and projects
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      const token = localStorage.getItem("token");
      const query = `
        query {
          users {
            id
            email
          }
          projects {
            id
            name
          }
        }
      `;

      try {
        console.log("Debug: Fetching dropdown options...");
        const response = await fetch("http://localhost:8080/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify({ query }),
        });

        const data = await response.json();
        console.log("Debug: Dropdown options fetched:", data);

        setUsers(data.data.users);
        setProjects(data.data.projects);
        setLoading(false);
      } catch (e: any) {
        console.error("Error: Failed to fetch dropdown options", e);
        setError("Failed to fetch dropdown options");
      }
    };

    fetchDropdownOptions();
  }, []);
  // Fetch total time spent
  useEffect(() => {
    if (!selectedUser || !selectedProject) return; // Skip if we don't have these IDs yet

    const fetchTotalTime = async () => {
      const token = localStorage.getItem("token");

      const query = `
  query GetTotalTimeSpent($userId: Float!, $projectId: String!, $startDate: String!, $endDate: String!) {
    getTotalTimeSpent(userId: $userId, projectId: $projectId, startDate: $startDate, endDate: $endDate)
  }
`;

      // Add startDate and endDate to the variables
      const variables = {
        userId: parseFloat(selectedUser),
        projectId: selectedProject,
        startDate: startDate,
        endDate: endDate,
      };

      try {
        console.log(
          "Debug: Fetching total time spent with variables:",
          variables
        );
        const response = await fetch("http://localhost:8080/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify({ query, variables }),
        });

        const data = await response.json();

        console.log("Debug: Total time fetched:", data);

        if (data.errors) {
          console.error("Error: ", data.errors[0].message);
          setError(data.errors[0].message);
        } else {
          setTotalTime(data.data.getTotalTimeSpent);
        }
      } catch (e) {
        console.error("Error: Failed to fetch total time", e);
        setError("Failed to fetch total time");
      } finally {
        setLoading(false);
      }
    };

    fetchTotalTime();
  }, [selectedUser, selectedProject, startDate, endDate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const formatMilliseconds = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative max-w-lg mx-auto p-6 bg-gray-200 rounded shadow-md flex flex-col">
      <h3 className="text-lg font-bold mb-4">Total Time Spent on Project</h3>

      <label
        htmlFor="userSelector"
        className="block text-sm font-medium text-gray-700 my-2"
      >
        Select a User:
      </label>
      <select
        id="userSelector"
        value={selectedUser || ""}
        onChange={(e) => setSelectedUser(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded text-black"
      >
        <option value="">Select a User</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.email}
          </option>
        ))}
      </select>

      <label
        htmlFor="projectSelector"
        className="block text-sm font-medium text-gray-700 my-2"
      >
        Select a Project:
      </label>
      <select
        id="projectSelector"
        value={selectedProject || ""}
        onChange={(e) => setSelectedProject(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded text-black"
      >
        <option value="">Select a Project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>

      <label
        htmlFor="startDatePicker"
        className="block text-sm font-medium text-gray-700 my-2"
      >
        Start Date:
      </label>
      <input
        type="date"
        id="startDatePicker"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded text-black my-2"
      />

      <label
        htmlFor="endDatePicker"
        className="block text-sm font-medium text-gray-700 my-2"
      >
        End Date:
      </label>
      <input
        type="date"
        id="endDatePicker"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded text-black my-2"
      />

      <p className="text-lg font-medium mt-4">
        Total Time: {formatMilliseconds(totalTime)}
      </p>
    </div>
  );
};

export default TotalTimeSpent;

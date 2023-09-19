import React, { useState, useEffect, useRef } from "react";

const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

const adjustForTimezone = (date: Date) => {
  const timeOffsetInMS = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() - timeOffsetInMS);
  return adjustedDate.toISOString().split("T")[1].substr(0, 8);
};

const TimeKeeper: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedRate, setSelectedRate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const startTimeRef = useRef<Date | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [previousElapsedTime, setPreviousElapsedTime] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      if (!startTime) {
        const current = new Date();
        const adjustedTime = adjustForTimezone(current);
        setStartTime(adjustedTime);
      }
      startTimeRef.current = new Date();
      timerIntervalRef.current = setInterval(() => {
        const now = new Date().getTime();
        const elapsed =
          now - (startTimeRef.current?.getTime() || now) + previousElapsedTime;
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        setPreviousElapsedTime(elapsedTime);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, previousElapsedTime, startTime]);

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setPreviousElapsedTime(0);
    const current = new Date().toISOString().substr(11, 8);
    setStartTime(current);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `{ users { id email} }`,
        }),
      });
      const data = await response.json();
      if (data && data.data && data.data.users) {
        setUsers(data.data.users);
      }
    };

    const fetchProjects = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `{ projects { id name teamId } }`,
        }),
      });
      const data = await response.json();
      if (data && data.data && data.data.projects) {
        setProjects(data.data.projects);
      }
    };

    fetchUsers();
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      if (!selectedProject) return;
      const token = localStorage.getItem("token");
      const chosenProject = projects.find((p) => p.id === selectedProject);
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `{ rates(teamId: "${chosenProject.teamId}") { id name rate} }`,
        }),
      });
      const data = await response.json();
      console.log("Rates response:", data);
      if (data && data.data && data.data.rates) {
        setRates(data.data.rates);
      }
    };
    fetchRates();
  }, [selectedProject, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalSeconds = Math.floor(elapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formattedElapsedTime = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const currentDate = getCurrentDate();
    const formattedStartTime = `${currentDate}T${startTime}.000Z`;
    const formattedEndTime = `${currentDate}T${formattedElapsedTime}.000Z`;

    console.log("Start Time:", startTime);
    console.log("Sending times:", formattedStartTime, formattedEndTime);

    // Fetch API logic
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation CreateTime($timeInputCreate: TimeInputCreate!) {
            createTime(timeInputCreate: $timeInputCreate) {
              id
              startTime
              endTime
            }
          }
        `,
        variables: {
          timeInputCreate: {
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            userId: parseFloat(selectedUser),
            projectId: selectedProject,
            rateId: parseFloat(selectedRate),
          },
        },
      }),
    });
    const data = await response.json();
    if (data.errors) {
      console.error("Error creating time entry:", data.errors);
    } else {
      console.log("Time entry created successfully:", data);
    }
  };

  return (
    <div>
      <h2>Time Keeper</h2>

      {/* Timer display */}
      <div>{new Date(elapsedTime).toISOString().substr(11, 8)}</div>

      {/* Resume/Stop button */}
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? "Stop" : "Start"}
      </button>

      {/* Reset button */}
      <button onClick={handleReset}>Reset</button>

      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
      >
        <option value="">Select a user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.email}
          </option>
        ))}
      </select>
      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
      >
        <option value="">Select a project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <select
        value={selectedRate}
        onChange={(e) => setSelectedRate(e.target.value)}
      >
        disabled={!selectedProject}
        <option value="">
          {selectedProject ? "Select a rate" : "Select a project first"}
        </option>
        {rates.map((rate) => (
          <option key={rate.id} value={rate.id}>
            {rate.name} {rate.rate}
          </option>
        ))}
      </select>
      <form onSubmit={handleSubmit}>
        <input
          type="time"
          step="1"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <button type="submit" disabled={elapsedTime === 0}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default TimeKeeper;

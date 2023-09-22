import React, { useState, useEffect, useRef } from "react";

const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

const adjustForTimezone = (date: Date) => {
  const timeOffsetInMS = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() - timeOffsetInMS);
  return adjustedDate.toISOString().split("T")[1].slice(0, 8);
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

  const [startTimeInputFocused, setStartTimeInputFocused] = useState(false);
  const [isInitial, setIsInitial] = useState(true);

  useEffect(() => {
    if (isInitial) {
      const interval = setInterval(() => {
        const current = new Date();
        const adjustedTime = adjustForTimezone(current);
        setStartTime(adjustedTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isInitial]);

  useEffect(() => {
    if (
      !isRunning &&
      !startTimeInputFocused &&
      !previousElapsedTime &&
      !startTimeRef.current
    ) {
      const interval = setInterval(() => {
        const current = new Date();
        const adjustedTime = adjustForTimezone(current);
        setStartTime(adjustedTime);
      }, 1000);
      return () => clearInterval(interval);
    }

    if (isRunning && !timerIntervalRef.current) {
      setIsInitial(false);
      if (!startTime) {
        const current = new Date();
        const adjustedTime = adjustForTimezone(current);
        console.log("Setting startTime:", adjustedTime);
        setStartTime(adjustedTime);
      }

      //   startTimeRef.current = new Date(startTime);

      const currentDate = getCurrentDate();
      const currentDateTime = new Date(`${currentDate}T${startTime}`);
      const adjustedTime = adjustForTimezone(currentDateTime);
      startTimeRef.current = new Date(`${currentDate}T${adjustedTime}`);

      // Set initial value of elapsed time to previousElapsedTime when resuming
      let currentElapsedTime = previousElapsedTime;

      timerIntervalRef.current = setInterval(() => {
        const now = new Date().getTime();
        currentElapsedTime += 1000; // Increase by one second
        // const elapsed =
        //   now - (startTimeRef.current?.getTime() || now) + previousElapsedTime;
        console.log(
          "Now:",
          now,
          "StartTime:",
          startTimeRef.current?.getTime(),
          //   "Elapsed:",
          //   elapsed
          "Elapsed:",
          currentElapsedTime
        );
        // setElapsedTime(elapsed);
        setElapsedTime(currentElapsedTime);
      }, 1000);
    } else if (!isRunning && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      setPreviousElapsedTime(elapsedTime);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, startTime, startTimeInputFocused]);

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setPreviousElapsedTime(0);
    const current = new Date();
    const adjustedTime = adjustForTimezone(current);
    setStartTime(adjustedTime);
    setIsInitial(true);
    startTimeRef.current = null;

    // Reset the dropdown menus
    setSelectedUser("");
    setSelectedProject("");
    setSelectedRate("");
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

  const formatDateForDisplay = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-400 rounded shadow-md flex flex-col">
      <h2 className="text-2xl mb-6 text-black flex items-center justify-center">
        § Track Time §
      </h2>

      <div className="text-xl mb-4 bg-gray-100 text-black flex items-center justify-center">
        {new Date(elapsedTime).toISOString().substr(11, 8).replace(/\./g, ":")}
      </div>

      <div className="mt-4">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="form-select block w-full mt-1"
        >
          <option value="" disabled>
            Select a user
          </option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="form-select block w-full mt-4"
        >
          <option className="text-black" value="">
            Select a project
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          value={selectedRate}
          onChange={(e) => setSelectedRate(e.target.value)}
          className="form-select block w-full mt-4"
          disabled={!selectedProject}
        >
          <option value="">Select a rate</option>
          {rates.map((rate) => (
            <option key={rate.id} value={rate.id}>
              {rate.name} {rate.rate}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex items-center justify-between">
          <label htmlFor="startTime" className="mr-2">
            Started at:
          </label>
          {/* <input
            id="startTime"
            type="text"
            value={startTime}
            onFocus={() => setStartTimeInputFocused(true)}
            onBlur={() => setStartTimeInputFocused(false)}
            onChange={(e) => {
              const formattedTime = e.target.value.replace(/\./g, ":");
              setStartTime(formattedTime);
            }}
            pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]"
            placeholder="00:00:00"
            className="form-input flex-grow text-center"
          /> */}
          <div className="text-center">
            {formatDateForDisplay(new Date())} {startTime}
          </div>
        </div>

        <div className="flex justify-between mt-auto py-6">
          <button
            type="button"
            onClick={() => {
              console.log(isRunning ? "Stopping timer" : "Starting timer");

              setIsRunning(!isRunning);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={!selectedUser || !selectedProject || !selectedRate}
          >
            {isRunning ? "Stop" : "Start"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={elapsedTime === 0}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimeKeeper;

import React, { useState, useEffect, useRef } from "react";

const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
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
const TimeKeeper: React.FC = () => {
  // State variables
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedRate, setSelectedRate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState<number>(0);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const [pausedTime, setPausedTime] = useState<number>(0);

  const [isTimerInitiallyStarted, setIsTimerInitiallyStarted] =
    useState<boolean>(false);

  const [isRunning, setIsRunning] = useState(false);

  // Fetch users and projects
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
          query: `{ users { id email } }`,
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
  // Fetch rates based on selected project
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
          query: `{ rates(teamId: "${chosenProject.teamId}") { id name rate } }`,
        }),
      });
      const data = await response.json();
      if (data && data.data && data.data.rates) {
        setRates(data.data.rates);
      }
    };
    fetchRates();
  }, [selectedProject, projects]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;

    if (isRunning) {
      if (!isTimerInitiallyStarted) {
        const newStartTime = new Date().toISOString();
        setStartTime(newStartTime);
        setIsTimerInitiallyStarted(true);
      }
      const currentDateTime = new Date();
      startTimeRef.current = pausedTime
        ? new Date(currentDateTime.getTime() - pausedTime)
        : currentDateTime;

      timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = startTimeRef.current
          ? now - startTimeRef.current.getTime()
          : 0;

        setElapsedTime(elapsed);
      }, 1000);

      timerIntervalRef.current = timerInterval;
    } else {
      clearInterval(timerIntervalRef.current as NodeJS.Timeout);
      setPausedTime(elapsedTime);
    }

    return () => {
      clearInterval(timerInterval);
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
    if (!isRunning && !startTime) {
      const newStartTime = new Date().toISOString();
      setStartTime(newStartTime);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Capture the time right before starting the entire operation
    const beforeOperationTime = new Date().getTime();

    const totalSeconds = Math.floor(elapsedTime / 1000);
    const totalMilliseconds = totalSeconds * 1000;

    const currentDate = getCurrentDate();
    const formattedStartTime = startTime;

    const startDate = new Date(startTime);

    // Debugging logs
    console.log("Start Date in ms:", startDate.getTime());
    console.log("Elapsed Time in ms:", elapsedTime);

    const endDate = new Date(startDate.getTime() + elapsedTime);

    // Debugging logs
    // console.log("End Date in ms:", endDate.getTime());

    const formattedEndTime = endDate.toISOString();

    console.log("Calculated End Time:", formattedEndTime);

    const token = localStorage.getItem("token");

    if (Number.isInteger(totalSeconds)) {
      console.log("totalElapsedTime is an integer:", totalSeconds);
    } else {
      console.log("totalElapsedTime is NOT an integer:", totalSeconds);
    }

    const localStartDate = new Date(startTime);

    const utcStartTime = new Date(
      localStartDate.getTime() - localStartDate.getTimezoneOffset() * 60000
    ).toISOString();

    const localEndDate = new Date(localStartDate.getTime() + elapsedTime);
    const utcEndTime = new Date(
      localEndDate.getTime() - localEndDate.getTimezoneOffset() * 60000
    ).toISOString();

    // Capture the time right before the fetch operation
    const beforeFetchTime = new Date().getTime();

    // Debugging logs
    console.log("End Date in ms:", endDate.getTime());

    console.log("Sending totalMilliseconds to API:", totalMilliseconds);

    console.log("Debugging payload sent to API:", {
      query: `
        mutation CreateTime($timeInputCreate: TimeInputCreate!) {
          createTime(timeInputCreate: $timeInputCreate) {
            id
            startTime
            endTime
            totalElapsedTime 
          }
        }
      `,
      variables: {
        timeInputCreate: {
          startTime: utcStartTime,
          endTime: utcEndTime,
          totalElapsedTime: totalMilliseconds,
          userId: parseFloat(selectedUser),
          projectId: selectedProject,
          rateId: parseFloat(selectedRate),
        },
      },
    });

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
              totalElapsedTime 
            }
          }
        `,
        variables: {
          timeInputCreate: {
            startTime: utcStartTime,
            endTime: utcEndTime,
            totalElapsedTime: totalMilliseconds,
            userId: parseFloat(selectedUser),
            projectId: selectedProject,
            rateId: parseFloat(selectedRate),
          },
        },
      }),
    });

    // Capture the time right after the fetch operation
    const afterFetchTime = new Date().getTime();

    // Log the time taken for the fetch operation
    console.log("Fetch Time Elapsed:", afterFetchTime - beforeFetchTime, "ms");

    const data = await response.json();
    if (data.errors) {
      console.error("Error creating time entry:", data.errors);
    } else {
      console.log("Time entry created successfully:", data);
    }

    // Capture the time right after the entire operation is complete
    const afterOperationTime = new Date().getTime();

    // Log the total time taken for the entire operation
    console.log(
      "Total Operation Time Elapsed:",
      afterOperationTime - beforeOperationTime,
      "ms"
    );
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setTotalElapsedTime(0); // Reset the new field
    setPausedTime(0); // Reset paused time
    startTimeRef.current = null;
    // Reset the dropdown menus
    setSelectedUser("");
    setSelectedProject("");
    setSelectedRate("");
    setIsTimerInitiallyStarted(false);
  };

  const formatTimeFromISOString = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const formattedTime = `${hours}:${minutes < 10 ? `0${minutes}` : minutes}:${
      seconds < 10 ? `0${seconds}` : seconds
    }`;
    return formattedTime;
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-400 rounded shadow-md flex flex-col">
      <h2 className="text-2xl mb-6 text-black flex items-center justify-center">
        § Track Time §
      </h2>
      <div className="text-xl mb-4 bg-gray-100 text-black flex items-center justify-center">
        {new Date(elapsedTime).toISOString().substr(11, 8)}
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
          <option value="" disabled>
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
        >
          <option value="" disabled>
            Select a rate
          </option>
          {rates.map((rate) => (
            <option key={rate.id} value={rate.id}>
              {rate.name} ({rate.rate})
            </option>
          ))}
        </select>
      </div>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex items-center justify-between">
          <label htmlFor="startTime" className="mr-2">
            Started at:
          </label>
          <div className="text-center">
            {formatDateForDisplay(new Date())}{" "}
            {formatTimeFromISOString(startTime)}
          </div>
        </div>
        <div className="flex justify-between mt-auto py-6">
          <button
            type="button"
            onClick={handleStartStop}
            className="px-4 py-2 bg-blue-500 text-white rounded"
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

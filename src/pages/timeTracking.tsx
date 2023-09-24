import React, { useState, useEffect, useRef } from "react";

const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

const adjustForTimezone = (date: Date) => {
  const timeOffsetInMS = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() - timeOffsetInMS);

  console.log("Date passed:", date);

  return adjustedDate.toISOString().split("T")[1].slice(0, 8);
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

  // useEffect(() => {
  //   console.log("Value of startTime: ", startTime);

  //   let timerInterval: NodeJS.Timeout; // Initialize timerInterval here
  //   if (isRunning) {
  //     const currentDate = getCurrentDate();
  //     // const currentDateTime = new Date(`${currentDate}T${startTime}`);
  //     const currentDateTime = new Date("2023-09-22T12:34:56");
  //     console.log("Current date", currentDateTime);
  //     const adjustedTime = adjustForTimezone(currentDateTime);
  //     startTimeRef.current = new Date(`${currentDate}T${adjustedTime}`);

  //     timerInterval = setInterval(() => {
  //       const now = new Date().getTime();
  //       const elapsed = now - (startTimeRef.current?.getTime() || now);
  //       setElapsedTime(elapsed);
  //       setTotalElapsedTime((prevTotal) => prevTotal + elapsed); // Update totalElapsedTime
  //     }, 1000);
  //     timerIntervalRef.current = timerInterval;
  //   } else if (timerIntervalRef.current) {
  //     clearInterval(timerIntervalRef.current);
  //     timerIntervalRef.current = null;
  //   }
  //   return () => {
  //     if (timerInterval) {
  //       clearInterval(timerInterval);
  //     }
  //   };
  // }, [isRunning, startTime]);

  // useEffect(() => {
  //   let timerInterval: NodeJS.Timeout; // Initialize timerInterval here
  //   if (isRunning) {
  //     console.log("Value of startTime before Date conversion:", startTime);

  //     const currentDateTime = new Date(); // Use the current date and time directly

  //     const timezoneOffsetInMinutes = currentDateTime.getTimezoneOffset();
  //     const offsetInMilliseconds = timezoneOffsetInMinutes * 60 * 1000;

  //     // Adjusting for timezone
  //     currentDateTime.setTime(currentDateTime.getTime() - offsetInMilliseconds);

  //     console.log(
  //       "Value of currentDateTime after Date conversion:",
  //       currentDateTime
  //     );

  //     console.log("Current date", currentDateTime);

  //     startTimeRef.current = currentDateTime; // Update the ref
  //     setStartTime(currentDateTime.toISOString()); // Update the state

  //     timerInterval = setInterval(() => {
  //       const now = new Date().getTime();
  //       const elapsed = now - (startTimeRef.current?.getTime() || now);

  //       // Add paused time to the elapsed time
  //       const totalElapsed = pausedTime + elapsed;

  //       // setElapsedTime(elapsed);
  //       setElapsedTime(totalElapsed);
  //       setTotalElapsedTime((prevTotal) => prevTotal + elapsed); // Update totalElapsedTime
  //     }, 1000);

  //     timerIntervalRef.current = timerInterval;
  //   } else if (timerIntervalRef.current) {
  //     clearInterval(timerIntervalRef.current);
  //     timerIntervalRef.current = null;

  //     // Store the elapsed time when the timer is stopped
  //     setPausedTime(elapsedTime);
  //   }
  //   return () => {
  //     if (timerInterval) {
  //       clearInterval(timerInterval);
  //     }
  //   };
  // }, [isRunning]);
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;

    if (isRunning) {
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
        setTotalElapsedTime((prevTotal) => prevTotal + elapsed); // Uncomment this line
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

  // const handleStartStop = () => {
  //   setIsRunning(!isRunning);
  //   if (!isRunning) {
  //     const newStartTime = new Date().toISOString();
  //     console.log("New Start Time: ", newStartTime);
  //     setStartTime(newStartTime);
  //   }
  // };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      const newStartTime = new Date().toISOString();
      setStartTime(newStartTime);
    }
  };

  useEffect(() => {
    console.log("Updated startTime: ", startTime);
  }, [startTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // const totalSeconds = Math.floor(totalElapsedTime / 1000);
    const totalSeconds = Math.floor(elapsedTime / 1000);

    // Converting to milliseconds as the backend expects time in milliseconds
    const totalMilliseconds = totalSeconds * 1000;

    console.log("Total Seconds before sending:", totalSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formattedTotalElapsedTime = `${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    console.log("Value of startTime: ", startTime);

    const currentDate = getCurrentDate();

    // const formattedStartTime = `${currentDate}T${startTime}.000Z`;
    const formattedStartTime = startTime;

    console.log("Current Date:", currentDate);
    console.log("Original Start Time:", startTime);
    console.log("Formatted Start Time:", formattedStartTime);

    // Convert startTime to a Date object
    const startDate = new Date(startTime);

    // Add totalElapsedTime (in milliseconds) to it
    const endDate = new Date(startDate.getTime() + elapsedTime);

    // Convert it to an ISO string
    const formattedEndTime = endDate.toISOString();

    console.log("Calculated End Time:", formattedEndTime);

    // const formattedEndTime = `${currentDate}T${formattedTotalElapsedTime}.000Z`;

    // Fetch API logic here, make sure to include 'totalElapsedTime' in the request
    const token = localStorage.getItem("token");

    console.log("Debugging variables before fetch:", {
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      totalElapsedTime: totalMilliseconds,
      userId: parseFloat(selectedUser),
      projectId: selectedProject,
      rateId: parseFloat(selectedRate),
    });

    // Add a type check for totalElapsedTime to ensure it is an integer
    if (Number.isInteger(totalSeconds)) {
      console.log("totalElapsedTime is an integer:", totalSeconds);
    } else {
      console.log("totalElapsedTime is NOT an integer:", totalSeconds);
    }

    // Convert local startTime to UTC
    const localStartDate = new Date(startTime);
    const utcStartTime = new Date(
      localStartDate.getTime() - localStartDate.getTimezoneOffset() * 60000
    ).toISOString();

    // Convert local endTime to UTC
    const localEndDate = new Date(localStartDate.getTime() + totalElapsedTime);
    const utcEndTime = new Date(
      localEndDate.getTime() - localEndDate.getTimezoneOffset() * 60000
    ).toISOString();

    console.log("UTC Start Time:", utcStartTime);
    console.log("UTC End Time:", utcEndTime);

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
            // startTime: formattedStartTime,
            // endTime: formattedEndTime,
            startTime: utcStartTime, // Use UTC time
            endTime: utcEndTime, // Use UTC time
            totalElapsedTime: totalMilliseconds,
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
            {/* {formatDateForDisplay(new Date())} {startTime} */}
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

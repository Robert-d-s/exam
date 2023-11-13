import React, { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  formatISO,
  parseISO,
  intervalToDuration,
  formatDuration,
} from "date-fns";
import {
  formatDateForDisplay,
  formatTimeFromISOString,
} from "../utils/timeUtils";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import useStore from "../lib/store";
import UserSelector from "../components/UserSelector";
import ProjectSelector from "../components/ProjectSelector";
import RateSelector from "../components/RateSelector";

// GraphQL Queries
const USERS_QUERY = gql`
  query GetUsers {
    users {
      id
      email
    }
  }
`;

const PROJECTS_QUERY = gql`
  query GetProjects {
    projects {
      id
      name
      teamId
    }
  }
`;

const RATES_QUERY = gql`
  query GetRates($teamId: String!) {
    rates(teamId: $teamId) {
      id
      name
      rate
    }
  }
`;

// GraphQL Mutations
const CREATE_TIME_MUTATION = gql`
  mutation CreateTime($timeInputCreate: TimeInputCreate!) {
    createTime(timeInputCreate: $timeInputCreate) {
      id
      startTime
      endTime
      totalElapsedTime
    }
  }
`;

const UPDATE_TIME_MUTATION = gql`
  mutation UpdateTime($timeInputUpdate: TimeInputUpdate!) {
    updateTime(timeInputUpdate: $timeInputUpdate) {
      id
      startTime
      endTime
      totalElapsedTime
    }
  }
`;

const DELETE_TIME_MUTATION = gql`
  mutation DeleteTime($id: Float!) {
    deleteTime(id: $id) {
      id
    }
  }
`;

const TIMES_QUERY = gql`
  query GetTimes($projectId: String!) {
    times(projectId: $projectId) {
      id
      startTime
      endTime
      userId
      projectId
      rateId
      totalElapsedTime
    }
  }
`;

const TimeKeeper: React.FC = () => {
  // Zustand store state and setters
  const {
    users,
    setUsers,
    projects,
    setProjects,
    rates,
    setRates,
    selectedUser,
    setSelectedUser,
    selectedProject,
    setSelectedProject,
    selectedRate,
    setSelectedRate,
    setTeamId,
  } = useStore();

  // Apollo GraphQL hooks
  const { data: usersData } = useQuery(USERS_QUERY);
  const { data: projectsData } = useQuery(PROJECTS_QUERY);
  const { data: ratesData, error: ratesError } = useQuery(RATES_QUERY, {
    variables: { teamId: useStore.getState().teamId },
  });
  // Mutation hooks
  const [createTime] = useMutation(CREATE_TIME_MUTATION);
  const [updateTime] = useMutation(UPDATE_TIME_MUTATION);
  const [deleteTime] = useMutation(DELETE_TIME_MUTATION);

  // Local component state
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pauseTimes, setPauseTimes] = useState<Date[]>([]);
  const [resumeTimes, setResumeTimes] = useState<Date[]>([]);
  const [displayTime, setDisplayTime] = useState("00:00:00");

  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);

  const [startDate, setStartDate] = useState(new Date());

  // References for intervals and accumulated time
  const timerIntervalRef = useRef<number | null>(null);

  const accumulatedTimeRef = useRef(0);

  // Query data handling
  useEffect(() => {
    if (usersData) setUsers(usersData.users);
    if (projectsData) setProjects(projectsData.projects);
    if (ratesData) setRates(ratesData.rates);
  }, [usersData, projectsData, ratesData, setUsers, setProjects, setRates]);

  // Error handling for the rates query
  useEffect(() => {
    if (ratesError) {
      console.error("Error fetching rates:", ratesError.message);
      // Handle or display the error as needed
    }
  }, [ratesError]);

  // Set the team ID when the selected project changes
  useEffect(() => {
    if (selectedProject) {
      const project = projects.find((p) => p.id === selectedProject);
      if (project) setTeamId(project.teamId);
    }
  }, [selectedProject, projects, setTeamId]);

  useEffect(() => {
    if (isRunning) {
      const updateDisplay = () => {
        const now = new Date();
        let elapsed = now.getTime() - (startTime ? startTime.getTime() : 0);

        console.log("Update Display - Current Time:", now);
        console.log("Elapsed Time before subtracting pauses:", elapsed);

        for (let i = 0; i < pauseTimes.length; i++) {
          const pauseTime = pauseTimes[i];
          const resumeTime = resumeTimes[i] || now;
          elapsed -= resumeTime.getTime() - pauseTime.getTime();
        }

        // Log detailed time calculation
        console.log("Elapsed time calculation:", {
          now,
          startTime,
          elapsed,
          pauseTimes,
          resumeTimes,
        });

        if (elapsed < 0) elapsed = 0;

        // Convert to hours, minutes, seconds and update displayTime
        let seconds = Math.floor((elapsed / 1000) % 60);
        let minutes = Math.floor((elapsed / (1000 * 60)) % 60);
        let hours = Math.floor(elapsed / (1000 * 60 * 60));

        const formattedTime = [
          hours.toString().padStart(2, "0"),
          minutes.toString().padStart(2, "0"),
          seconds.toString().padStart(2, "0"),
        ].join(":");

        setDisplayTime(formattedTime);
      };

      // timerIntervalRef.current = setInterval(updateDisplay, 1000);
      timerIntervalRef.current = Number(setInterval(updateDisplay, 1000));

      return () => {
        if (timerIntervalRef.current !== null) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [isRunning, startTime, pauseTimes, resumeTimes]);

  // const handleStartStop = () => {
  //   const now = new Date();

  //   if (isRunning) {
  //     setPauseTimes((prevPauseTimes) => [...prevPauseTimes, now]);
  //     setIsRunning(false);
  //   } else {
  //     if (!startTime) {
  //       const start = startDate > now ? now : startDate;
  //       console.log("Setting start time to:", start);

  //       setStartTime(start);

  //       // setStartTime(now);
  //     } else {
  //       setResumeTimes((prevResumeTimes) => [...prevResumeTimes, now]);
  //     }
  //     setIsRunning(true);
  //   }

  const handleStartStop = () => {
    const now = new Date();
    console.log("Start Time set to:", startTime);
    if (isRunning) {
      const newPauseTimes = [...pauseTimes, now];
      console.log("Pausing timer at:", now, "New pause times:", newPauseTimes);
      setPauseTimes(newPauseTimes);
      setIsRunning(false);
      // Use newPauseTimes directly for any immediate logic
    } else {
      if (!startTime) {
        const start = startDate > now ? now : startDate;
        console.log("Setting start time to:", start);
        setStartTime(start);
      } else {
        const newResumeTimes = [...resumeTimes, now];
        console.log(
          "Resuming timer at:",
          now,
          "New resume times:",
          newResumeTimes
        );
        setResumeTimes(newResumeTimes);
        // Use newResumeTimes directly for any immediate logic
      }
      setIsRunning(true);
    }
    // Logging for debugging
    console.log("Pause Times after update:", pauseTimes);
    console.log("Resume Times after update:", resumeTimes);
  };

  // Reset timer logic
  const handleReset = () => {
    setIsRunning(false);
    setStartTime(null);
    setPauseTimes([]);
    setResumeTimes([]);
    setDisplayTime("00:00:00");
    accumulatedTimeRef.current = 0;
    setCurrentEntryId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!startTime) {
      console.error("No start time set.");
      return;
    }

    const submissionTime = new Date();
    console.log("Frontend - Formatted End Time:", formatISO(submissionTime));
    console.log(
      "Submitting time. Start Time:",
      startTime,
      "End Time:",
      submissionTime
    );
    const totalElapsedTime =
      accumulatedTimeRef.current +
      (submissionTime.getTime() - startTime.getTime()) -
      pauseTimes.reduce((acc, time, index) => {
        const resumeTime = resumeTimes[index] || submissionTime;
        return acc + (resumeTime.getTime() - time.getTime());
      }, 0);

    console.log("Frontend - Formatted Start Time:", formatISO(startTime));
    console.log("Frontend - Formatted End Time:", formatISO(submissionTime));
    console.log("Total Elapsed Time on Submit:", totalElapsedTime);

    try {
      let result;

      if (currentEntryId) {
        // Update existing time entry
        const updateVariables = {
          id: currentEntryId,
          endTime: formatISO(submissionTime),
          totalElapsedTime,
        };
        result = await updateTime({
          variables: { timeInputUpdate: updateVariables },
        });
      } else {
        // Create new time entry
        const createVariables = {
          startTime: formatISO(startTime),
          endTime: formatISO(submissionTime),
          projectId: selectedProject,
          userId: parseFloat(selectedUser),
          rateId: parseFloat(selectedRate),
          totalElapsedTime,
        };
        result = await createTime({
          variables: { timeInputCreate: createVariables },
        });
        setCurrentEntryId(result.data.createTime.id);
      }

      console.log("Time entry result:", result);
    } catch (error) {
      console.error("Error with time entry:", error);
    }
  };

  const handleDateChange = (date: Date | null) => {
    const now = new Date();
    if (date) {
      if (date > now) {
        // Notify user if the selected date is in the future
        alert("Please select a current or past date/time.");
      } else {
        // Set the date only if it's not in the future
        setStartDate(date);
        setStartTime(null);
      }
    } else {
      // If the date picker returns null (e.g., the date is cleared), handle accordingly
      // For example, you can reset the date to now or handle it based on your application's needs
      setStartDate(now); // Reset to now or another default value as needed
    }
  };

  // Render component JSX
  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-400 rounded shadow-md flex flex-col">
      <h2 className="text-2xl mb-6 text-black flex items-center justify-center">
        § Track Time §
      </h2>
      <div className="text-xl mb-4 bg-gray-100 text-black flex items-center justify-center">
        {displayTime}
      </div>
      <div className="mt-4">
        <UserSelector
          users={users}
          selectedUser={selectedUser}
          onUserChange={(userId) => setSelectedUser(userId)}
        />
        <ProjectSelector
          projects={projects}
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
        />
        <RateSelector
          rates={rates}
          selectedRate={selectedRate}
          onRateChange={setSelectedRate}
        />
      </div>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex items-center justify-between">
          <label htmlFor="startTime" className="mr-2">
            Started at:
          </label>
          <div className="text-center">
            {startTime
              ? `${formatDateForDisplay(
                  parseISO(formatISO(startTime))
                )} ${formatTimeFromISOString(formatISO(startTime))}`
              : "Not Started"}
          </div>
        </div>

        {/* DatePicker for custom start time */}
        <div className="mt-4 mb-6">
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            Start Time:
          </label>
          <DatePicker
            id="startDate"
            selected={startDate}
            onChange={handleDateChange}
            showTimeSelect
            dateFormat="Pp"
            className="form-control block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-between mt-auto py-6">
          <button
            type="button"
            onClick={handleStartStop}
            className={`px-4 py-2 ${
              isRunning ? "bg-red-500" : "bg-green-500"
            } text-white rounded`}
            disabled={!selectedUser || !selectedProject || !selectedRate}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
            disabled={!startTime}
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={isRunning || !startTime}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimeKeeper;

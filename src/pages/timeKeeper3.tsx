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

  // References for intervals and accumulated time
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
        const totalElapsedTime =
          accumulatedTimeRef.current +
          (startTime ? now.getTime() - startTime.getTime() : 0) -
          pauseTimes.reduce((acc, time, index) => {
            const resumeTime = resumeTimes[index] || now;
            return acc + (resumeTime.getTime() - time.getTime());
          }, 0);

        // Convert totalElapsedTime to hours, minutes, and seconds
        let seconds = Math.floor((totalElapsedTime / 1000) % 60);
        let minutes = Math.floor((totalElapsedTime / (1000 * 60)) % 60);
        let hours = Math.floor((totalElapsedTime / (1000 * 60 * 60)) % 24);

        // Format the time components to add leading zeros
        const formattedTime = [
          hours.toString().padStart(2, "0"),
          minutes.toString().padStart(2, "0"),
          seconds.toString().padStart(2, "0"),
        ].join(":");

        setDisplayTime(formattedTime);
      };

      updateDisplay();
      timerIntervalRef.current = setInterval(updateDisplay, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [isRunning, startTime, pauseTimes, resumeTimes]);

  // Start/Stop Timer logic
  const handleStartStop = () => {
    if (isRunning) {
      // Stop timer logic
      setPauseTimes([...pauseTimes, new Date()]);
      setIsRunning(false);
    } else {
      // Start timer logic
      if (!startTime) {
        setStartTime(new Date());
      } else {
        setResumeTimes([...resumeTimes, new Date()]);
      }
      setIsRunning(true);
    }
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
    const totalElapsedTime =
      accumulatedTimeRef.current +
      (submissionTime.getTime() - startTime.getTime()) -
      pauseTimes.reduce((acc, time, index) => {
        const resumeTime = resumeTimes[index] || submissionTime;
        return acc + (resumeTime.getTime() - time.getTime());
      }, 0);

    console.log("Frontend - Formatted Start Time:", formatISO(startTime));
    console.log("Frontend - Formatted End Time:", formatISO(submissionTime));

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

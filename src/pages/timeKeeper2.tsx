import React, { useEffect, useRef } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import useStore from "../lib/store";

import UserSelector from "../components/UserSelector";
import ProjectSelector from "../components/ProjectSelector";
import RateSelector from "../components/RateSelector";
import {
  formatDateForDisplay,
  formatTimeFromISOString,
} from "../utils/timeUtils";

interface Time {
  id: number;
  startTime: string;
  endTime: string | null;
  userId: number;
  projectId: string;
  rateId: number;
  totalElapsedTime: number;
}

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
  const {
    users,
    projects,
    rates,
    selectedUser,
    selectedProject,
    selectedRate,
    setUsers,
    setProjects,
    setRates,
    setSelectedUser,
    setSelectedProject,
    setSelectedRate,
    setTeamId,
  } = useStore();

  const { data: usersData } = useQuery(USERS_QUERY);
  const { data: projectsData } = useQuery(PROJECTS_QUERY);
  const { teamId } = useStore();
  const { data: ratesData, error } = useQuery(RATES_QUERY, {
    variables: { teamId },
  });

  const [createTime] = useMutation(CREATE_TIME_MUTATION);
  const [updateTime] = useMutation(UPDATE_TIME_MUTATION);
  const [deleteTime] = useMutation(DELETE_TIME_MUTATION);

  useEffect(() => {
    // Update the teamId in the Zustand store when selectedProject changes
    const selectedProjectObj = projects.find(
      (project) => project.id === selectedProject
    );
    if (selectedProjectObj && selectedProjectObj.teamId) {
      setTeamId(selectedProjectObj.teamId);
    }
  }, [selectedProject, projects, setTeamId]);

  useEffect(() => {
    if (usersData) {
      setUsers(usersData.users);
    }
    if (projectsData) {
      setProjects(projectsData.projects);
    }
    if (ratesData) {
      setRates(ratesData.rates);
    }
  }, [usersData, projectsData, ratesData]);

  const startTimeRef = useRef<number | null>(null);

  const [isRunning, setIsRunning] = React.useState(false);
  const [isTimerInitiallyStarted, setIsTimerInitiallyStarted] =
    React.useState(false);
  const [startTime, setStartTime] = React.useState<string>("");
  const [elapsedTime, setElapsedTime] = React.useState<number>(0);
  const [pausedTime, setPausedTime] = React.useState<number>(0);

  const animationFrameRef = useRef<number | null>(null);

  const updateTimer = () => {
    console.log(
      "updateTimer called. Current startTimeRef.current:",
      startTimeRef.current
    );
    if (typeof startTimeRef.current === "number") {
      const now = performance.now();
      const newElapsedTime = now - startTimeRef.current;
      setElapsedTime(newElapsedTime); // Add the pausedTime to the new elapsed time
      console.log("Timer updated. New elapsedTime:", newElapsedTime);
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  };

  useEffect(() => {
    console.log("Effect for isRunning changes. Current isRunning:", isRunning);
    if (isRunning) {
      console.log("Effect is starting or resuming the timer.");
      if (!isTimerInitiallyStarted) {
        startTimeRef.current = performance.now();
        setIsTimerInitiallyStarted(true);
      } else if (pausedTime) {
        // Adjust the startTimeRef to account for the paused time
        startTimeRef.current = performance.now() - pausedTime;
      }
      animationFrameRef.current = requestAnimationFrame(updateTimer);
      console.log(
        "Effect started the timer. animationFrameRef.current:",
        animationFrameRef.current
      );
    } else {
      console.log("Effect is stopping the timer.");
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        console.log(
          "Effect stopped the timer. animationFrameRef.current:",
          animationFrameRef.current
        );
      }
      setPausedTime(elapsedTime);
      console.log("Effect has set paused time to:", elapsedTime);
    }

    // Clean up the animation frame request when the component unmounts or the timer stops
    return () => {
      if (animationFrameRef.current) {
        console.log(
          "Effect cleanup. Cancelling animation frame. animationFrameRef.current:",
          animationFrameRef.current
        );
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  const handleStartStop = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log(
      "Start/Stop button clicked. Previous isRunning state:",
      isRunning
    );
    setIsRunning((prevIsRunning) => {
      console.log(
        "Toggling isRunning from:",
        prevIsRunning,
        "to:",
        !prevIsRunning
      );
      if (!prevIsRunning) {
        console.log(
          "Starting or resuming the timer. Current pausedTime:",
          pausedTime
        );
        const now = performance.now();
        startTimeRef.current = now - (pausedTime || 0);
        setStartTime(new Date().toISOString()); // Set the startTime state when the timer starts
        setPausedTime(0);
        console.log(
          `Timer started. startTimeRef.current: ${startTimeRef.current}, startTime: ${startTime}`
        );
      } else {
        console.log("Pausing the timer. Current elapsedTime:", elapsedTime);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        setPausedTime(elapsedTime);
        console.log(
          `Timer stopped. elapsedTime: ${elapsedTime}, pausedTime: ${pausedTime}`
        );
      }

      return !prevIsRunning;
    });
  };

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsRunning(false);
    setElapsedTime(0);
    setPausedTime(0);
    startTimeRef.current = null;
    setSelectedUser("");
    setSelectedProject("");
    setSelectedRate("");
    setIsTimerInitiallyStarted(false);
    setStartTime("");
  };

  //   const handleSubmit = async (e: React.FormEvent) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handleSubmit called");

    // Check if the start time is set and is a number
    if (!startTime || typeof startTimeRef.current !== "number") {
      console.log("Invalid start time. Aborting handleSubmit.");
      return;
    }

    const utcEndTime = new Date().toISOString(); // Capture current UTC end time
    console.log("Current UTC end time:", utcEndTime);
    const timezoneOffset = new Date().getTimezoneOffset() * 60000; // offset in milliseconds
    console.log("User's timezone offset in milliseconds:", timezoneOffset);

    // Adjust for timezone - this assumes you want to adjust to the user's local timezone
    const adjustedStartTime = new Date(
      new Date(startTime).getTime() - timezoneOffset
    ).toISOString();
    console.log("Adjusted start time:", adjustedStartTime);
    const adjustedEndTime = new Date(
      new Date(utcEndTime).getTime() - timezoneOffset
    ).toISOString();
    console.log("Adjusted end time:", adjustedEndTime);

    try {
      const result = await createTime({
        variables: {
          timeInputCreate: {
            startTime: adjustedStartTime,
            endTime: adjustedEndTime,
            totalElapsedTime: elapsedTime,
            userId: parseFloat(selectedUser),
            projectId: selectedProject,
            rateId: parseFloat(selectedRate),
          },
        },
      });
      console.log("createTime result:", result.data.createTime);
      // After submission, reset only the elapsed time and paused time if needed
    } catch (error) {
      console.error("Error creating time:", error);
    }
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
              ? `${formatDateForDisplay(new Date())} ${formatTimeFromISOString(
                  startTime
                )}`
              : "Not Started"}
          </div>
        </div>
        <div className="flex justify-between mt-auto py-6">
          <button
            type="button"
            onClick={handleStartStop}
            disabled={!selectedUser || !selectedProject || !selectedRate}
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
            disabled={isRunning || elapsedTime === 0}
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

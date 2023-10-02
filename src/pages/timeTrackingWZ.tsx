import React, { useEffect } from "react";
import create from "zustand";
import { format } from "date-fns";
import { ChevronDownIcon } from "@heroicons/react/solid";

type TimeKeeperState = {
  users: any[];
  projects: any[];
  rates: any[];
  selectedUser: string;
  selectedProject: string;
  selectedRate: string;
  startTime: string;
  elapsedTime: number;
  pausedTime: number;
  isTimerInitiallyStarted: boolean;
  isRunning: boolean;
  setUsers: (users: any[]) => void;
  setProjects: (projects: any[]) => void;
  setRates: (rates: any[]) => void;
  setSelectedUser: (user: string) => void;
  setSelectedProject: (project: string) => void;
  setSelectedRate: (rate: string) => void;
  setStartTime: (startTime: string) => void;
  setElapsedTime: (elapsedTime: number) => void;
  setPausedTime: (pausedTime: number) => void;
  setIsTimerInitiallyStarted: (isTimerInitiallyStarted: boolean) => void;
  setIsRunning: (isRunning: boolean) => void;
};

const useTimeKeeperStore = create<TimeKeeperState>((set) => ({
  users: [],
  projects: [],
  rates: [],
  selectedUser: "",
  selectedProject: "",
  selectedRate: "",
  startTime: "",
  elapsedTime: 0,
  pausedTime: 0,
  isTimerInitiallyStarted: false,
  isRunning: false,
  setUsers: (users) => set({ users }),
  setProjects: (projects) => set({ projects }),
  setRates: (rates) => set({ rates }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  setSelectedRate: (selectedRate) => set({ selectedRate }),
  setStartTime: (startTime) => set({ startTime }),
  setElapsedTime: (elapsedTime) => set({ elapsedTime }),
  setPausedTime: (pausedTime) => set({ pausedTime }),
  setIsTimerInitiallyStarted: (isTimerInitiallyStarted) =>
    set({ isTimerInitiallyStarted }),
  setIsRunning: (isRunning) => set({ isRunning }),
}));

const TimeKeeper: React.FC = () => {
  const {
    users,
    projects,
    rates,
    selectedUser,
    selectedProject,
    selectedRate,
    startTime,
    elapsedTime,
    pausedTime,
    isTimerInitiallyStarted,
    isRunning,
    setUsers,
    setProjects,
    setRates,
    setSelectedUser,
    setSelectedProject,
    setSelectedRate,
    setStartTime,
    setElapsedTime,
    setPausedTime,
    setIsTimerInitiallyStarted,
    setIsRunning,
  } = useTimeKeeperStore();

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

    fetchUsers();
    fetchProjects();
    fetchRates();
  }, []);

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = event.target.value;
    setSelectedUser(selectedUser);
  };

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProject = event.target.value;
    setSelectedProject(selectedProject);
  };

  const handleRateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRate = event.target.value;
    setSelectedRate(selectedRate);
  };

  const handleStartTimer = () => {
    // ...
  };

  const handleStopTimer = () => {
    // ...
  };

  const handleResetTimer = () => {
    // ...
  };

  const formatTime = (time: number) => {
    const date = new Date(time);
    return format(date, "HH:mm:ss");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Time Keeper</h1>
        <div className="mt-4">
          <label htmlFor="user-select" className="block font-medium">
            User:
          </label>
          <div className="relative mt-1">
            <select
              id="user-select"
              value={selectedUser}
              onChange={handleUserChange}
              className="block w-full px-4 py-2 pr-8 leading-tight border-gray-300 rounded appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDownIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="project-select" className="block font-medium">
            Project:
          </label>
          <div className="relative mt-1">
            <select
              id="project-select"
              value={selectedProject}
              onChange={handleProjectChange}
              className="block w-full px-4 py-2 pr-8 leading-tight border-gray-300 rounded appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDownIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="rate-select" className="block font-medium">
            Rate:
          </label>
          <div className="relative mt-1">
            <select
              id="rate-select"
              value={selectedRate}
              onChange={handleRateChange}
              className="block w-full px-4 py-2 pr-8 leading-tight border-gray-300 rounded appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
            >
              {rates.map((rate) => (
                <option key={rate.id} value={rate.id}>
                  {rate.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDownIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleStartTimer}
            className="px-4 py-2 mr-2 font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue active:bg-blue-600"
          >
            Start
          </button>
          <button
            onClick={handleStopTimer}
            className="px-4 py-2 mr-2 font-medium text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:shadow-outline-red active:bg-red-600"
          >
            Stop
          </button>
          <button
            onClick={handleResetTimer}
            className="px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:shadow-outline-gray active:bg-gray-300"
          >
            Reset
          </button>
        </div>
        <div className="mt-4">
          <p className="font-medium">Elapsed Time:</p>
          <p className="text-2xl">{formatTime(elapsedTime)}</p>
        </div>
        <div className="mt-2">
          <p className="font-medium">Paused Time:</p>
          <p className="text-2xl">{formatTime(pausedTime)}</p>
        </div>
      </div>
    </div>
  );
};

export default TimeKeeper;

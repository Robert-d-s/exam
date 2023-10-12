// src/lib/store.ts
import { create } from "zustand";

type Store = {
  users: any[];
  projects: any[];
  rates: any[];
  selectedUser: string;
  selectedProject: string;
  selectedRate: string;
  setUsers: (users: any[]) => void;
  setProjects: (projects: any[]) => void;
  setRates: (rates: any[]) => void;
  setSelectedUser: (selectedUser: string) => void;
  setSelectedProject: (selectedProject: string) => void;
  setSelectedRate: (selectedRate: string) => void;

  teamId: string | null;
  setTeamId: (teamId: string | null) => void;
};

const useStore = create<Store>((set) => ({
  users: [],
  projects: [],
  rates: [],
  selectedUser: "",
  selectedProject: "",
  selectedRate: "",
  setUsers: (users) => set({ users }),
  setProjects: (projects) => set({ projects }),
  setRates: (rates) => set({ rates }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  setSelectedRate: (selectedRate) => set({ selectedRate }),

  teamId: null,
  setTeamId: (teamId) => set({ teamId }),
}));

export default useStore;

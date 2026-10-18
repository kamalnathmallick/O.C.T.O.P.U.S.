import { create } from 'zustand';

interface Machine {
  id: string;
  name: string;
  type: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  department?: string;
  machineGroup?: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  healthScore: number;
  installDate?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  sensors?: any[];
  _count?: any;
}

interface MachineState {
  machines: Machine[];
  selectedMachine: Machine | null;
  isLoading: boolean;
  setMachines: (machines: Machine[]) => void;
  setSelectedMachine: (machine: Machine | null) => void;
  setLoading: (loading: boolean) => void;
  addMachine: (machine: Machine) => void;
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  removeMachine: (id: string) => void;
}

export const useMachineStore = create<MachineState>((set) => ({
  machines: [],
  selectedMachine: null,
  isLoading: false,
  setMachines: (machines) => set({ machines }),
  setSelectedMachine: (machine) => set({ selectedMachine: machine }),
  setLoading: (loading) => set({ isLoading: loading }),
  addMachine: (machine) =>
    set((state) => ({ machines: [...state.machines, machine] })),
  updateMachine: (id, updates) =>
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  removeMachine: (id) =>
    set((state) => ({
      machines: state.machines.filter((m) => m.id !== id),
    })),
}));
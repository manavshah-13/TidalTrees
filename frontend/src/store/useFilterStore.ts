import { create } from 'zustand';

export type FilterSeverity = 'all' | 'low' | 'medium' | 'high' | 'critical';
export type FilterStatus = 'all' | 'pending' | 'validated' | 'rejected';

interface FilterState {
  severity: FilterSeverity;
  status: FilterStatus;
  searchTerm: string;
  page: number;
  pageSize: number;
  setSeverity: (severity: FilterSeverity) => void;
  setStatus: (status: FilterStatus) => void;
  setSearchTerm: (term: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  severity: 'all',
  status: 'all',
  searchTerm: '',
  page: 1,
  pageSize: 9,

  setSeverity: (severity) => set({ severity, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setSearchTerm: (searchTerm) => set({ searchTerm, page: 1 }),
  setPage: (page) => set({ page }),

  resetFilters: () =>
    set({
      severity: 'all',
      status: 'all',
      searchTerm: '',
      page: 1,
    }),
}));

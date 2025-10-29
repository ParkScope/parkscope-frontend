import { useState, useCallback } from 'react';

export interface UseUIReturn {
  sidebarOpen: boolean;
  realTimeActive: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setRealTimeActive: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  toggleRealTimeUpdate: () => void;
}

export const useUI = (): UseUIReturn => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [realTimeActive, setRealTimeActive] = useState<boolean>(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const toggleRealTimeUpdate = useCallback(() => {
    setRealTimeActive(prev => !prev);
  }, []);

  return {
    sidebarOpen,
    realTimeActive,
    setSidebarOpen,
    setRealTimeActive,
    toggleSidebar,
    toggleRealTimeUpdate,
  };
};

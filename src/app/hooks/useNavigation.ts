import { useState, useCallback } from 'react';

export interface UseNavigationReturn {
  navigationPath: { x: number; y: number }[] | null;
  animationProgress: number;
  showEntranceModal: boolean;
  setNavigationPath: React.Dispatch<React.SetStateAction<{ x: number; y: number }[] | null>>;
  setAnimationProgress: React.Dispatch<React.SetStateAction<number>>;
  setShowEntranceModal: React.Dispatch<React.SetStateAction<boolean>>;
  startAnimation: () => (() => void) | undefined;
  handleNavigate: () => void;
}

export const useNavigation = (): UseNavigationReturn => {
  const [navigationPath, setNavigationPath] = useState<{ x: number; y: number }[] | null>(null);
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  const [showEntranceModal, setShowEntranceModal] = useState<boolean>(false);

  const startAnimation = useCallback(() => {
    if (navigationPath) {
      const interval = setInterval(() => {
        setAnimationProgress((prev) => {
          const next = prev + 0.02;
          return next >= 1 ? 0 : next;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [navigationPath]);

  const handleNavigate = useCallback(() => {
    setShowEntranceModal(true);
  }, []);

  return {
    navigationPath,
    animationProgress,
    showEntranceModal,
    setNavigationPath,
    setAnimationProgress,
    setShowEntranceModal,
    startAnimation,
    handleNavigate,
  };
};

import { useState, useCallback } from 'react';
import { FloorSaveRequest, BackendFloorInfo } from '../types';
import { saveFloorInfo, getLatestFloorInfo } from '../utils/apiClient';

export interface UseFloorInfoReturn {
  currentFloorInfo: BackendFloorInfo | null;
  isLoading: boolean;
  error: string | null;
  saveFloorInfo: (floorData: FloorSaveRequest) => Promise<boolean>;
  loadLatestFloorInfo: () => Promise<void>;
  clearError: () => void;
}

export const useFloorInfo = (): UseFloorInfoReturn => {
  const [currentFloorInfo, setCurrentFloorInfo] = useState<BackendFloorInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadLatestFloorInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🏢 최신 층 정보 로드 중...');
      
      const response = await getLatestFloorInfo();
      if (response.success && response.data) {
        setCurrentFloorInfo(response.data);
        console.log('✅ 층 정보 로드 완료:', response.data);
      } else {
        const errorMsg = `층 정보 로드 실패: ${response.error || '알 수 없는 오류'}`;
        setError(errorMsg);
        console.error('❌', errorMsg);
      }
    } catch (error) {
      const errorMsg = `층 정보 로드 중 오류: ${error}`;
      setError(errorMsg);
      console.error('💥', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveFloorInfoData = useCallback(async (floorData: FloorSaveRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('💾 층 정보 저장 중...', floorData);
      
      const response = await saveFloorInfo(floorData);
      if (response.success && response.data) {
        setCurrentFloorInfo(response.data);
        console.log('✅ 층 정보 저장 완료:', response.data);
        return true;
      } else {
        const errorMsg = `층 정보 저장 실패: ${response.error || '알 수 없는 오류'}`;
        setError(errorMsg);
        console.error('❌', errorMsg);
        return false;
      }
    } catch (error) {
      const errorMsg = `층 정보 저장 중 오류: ${error}`;
      setError(errorMsg);
      console.error('💥', errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    currentFloorInfo,
    isLoading,
    error,
    saveFloorInfo: saveFloorInfoData,
    loadLatestFloorInfo,
    clearError,
  };
};

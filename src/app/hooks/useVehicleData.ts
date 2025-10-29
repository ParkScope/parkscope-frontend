import { useState, useCallback } from 'react';
import { Vehicle, BackendVehicle, RegisterVehicleRequest } from '../types';
import { getVehicles, registerVehicle, getLatestResult, convertImageUrl } from '../utils/apiClient';

export interface UseVehicleDataReturn {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  addVehicle: (vehicle: Vehicle) => void;
  loadVehiclesFromBackend: () => Promise<void>;
  searchVehicleByAPI: (query: string) => Promise<Vehicle | null>;
  convertBackendVehicle: (backendVehicle: BackendVehicle) => Vehicle;
  registerVehicleToBackend: (vehicleData: RegisterVehicleRequest) => Promise<BackendVehicle | null>;
}

export const useVehicleData = (initialVehicles: Vehicle[] = []): UseVehicleDataReturn => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);

  const convertBackendVehicle = useCallback((backendVehicle: BackendVehicle): Vehicle => {
    return {
      id: backendVehicle.id,
      licensePlate: backendVehicle.licensePlate,
      timestamp: new Date(backendVehicle.timestamp),
      imageUrl: backendVehicle.imageUrl,
      confidence: backendVehicle.confidence,
      isFromAPI: true,
    };
  }, []);

  const addVehicle = useCallback((vehicle: Vehicle) => {
    setVehicles(prev => {
      const existingIndex = prev.findIndex(v => v.licensePlate === vehicle.licensePlate);
      if (existingIndex !== -1) {
        // 기존 차량이 있으면 업데이트
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...vehicle,
          timestamp: vehicle.timestamp, // 최신 타임스탬프로 업데이트
        };
        console.log(`🔄 기존 차량 정보 업데이트: ${vehicle.licensePlate}`);
        return updated;
      } else {
        // 새 차량 추가
        console.log(`➕ 새 차량 추가: ${vehicle.licensePlate}`);
        return [...prev, vehicle];
      }
    });
  }, []);

  const loadVehiclesFromBackend = useCallback(async () => {
    try {
      console.log('🔄 백엔드에서 기존 차량 데이터 로드 중...');
      
      const vehiclesResponse = await getVehicles();
      if (vehiclesResponse.success && vehiclesResponse.data) {
        const backendVehicles = vehiclesResponse.data.map(convertBackendVehicle);
        console.log('✅ 백엔드 차량 데이터 로드 완료:', backendVehicles.length, '대');
        
        setVehicles(prev => {
          const mergedVehicles = [...prev];
          
          backendVehicles.forEach(backendVehicle => {
            const existingIndex = mergedVehicles.findIndex(v => v.licensePlate === backendVehicle.licensePlate);
            if (existingIndex !== -1) {
              // 기존 차량이 있으면 최신 정보로 업데이트
              mergedVehicles[existingIndex] = {
                ...mergedVehicles[existingIndex],
                ...backendVehicle,
              };
            } else {
              // 새 차량 추가
              mergedVehicles.push(backendVehicle);
            }
          });
          
          return mergedVehicles;
        });
      }
    } catch (error) {
      console.error('❌ 백엔드 차량 데이터 로드 실패:', error);
      throw error;
    }
  }, [convertBackendVehicle]);

  const searchVehicleByAPI = useCallback(async (query: string): Promise<Vehicle | null> => {
    try {
      console.log(`🌐 ESP32-CAM API로 차량 검색: ${query}`);
      
      const response = await getLatestResult();
      console.log(`📡 API 응답:`, response);
      
      if (response.success && response.data) {
        console.log(`✅ API 성공! 위치: ${response.data.ocr_text}`);
        
        // 이미지 URL 변환
        let validImageUrl = undefined;
        if (response.data.photo_url) {
          validImageUrl = convertImageUrl(response.data.photo_url);
          console.log('변환된 이미지 URL:', validImageUrl);
        }
        
        // API에서 받은 데이터로 새로운 Vehicle 생성
        const apiVehicle: Vehicle = {
          id: `api_${Date.now()}`,
          licensePlate: query,
          timestamp: new Date(response.data.created_at || new Date()),
          imageUrl: validImageUrl,
          confidence: response.data.confidence,
          isFromAPI: true,
        };

        // 차량을 vehicles 배열에 추가
        addVehicle(apiVehicle);

        // 백엔드에 차량 정보 저장
        try {
          const vehicleData = {
            licensePlate: query,
            parkingSpaceId: response.data.ocr_text,
            timestamp: new Date().toISOString(),
            imageUrl: validImageUrl || "",
            confidence: response.data.confidence || 0,
            ocrResultId: response.data._id,
          };
          
          console.log(`💾 백엔드에 차량 정보 저장 중...`, vehicleData);
          const saveResponse = await registerVehicle(vehicleData);
          if (saveResponse.success) {
            console.log(`✅ 백엔드 저장 완료:`, saveResponse.data);
          } else {
            console.error(`❌ 백엔드 저장 실패:`, saveResponse.error);
          }
        } catch (saveError) {
          console.error(`💥 백엔드 저장 중 오류:`, saveError);
        }

        return apiVehicle;
      } else {
        console.error(`❌ API 실패:`, response.error);
        return null;
      }
    } catch (error) {
      console.error('💥 API 호출 실패:', error);
      throw error;
    }
  }, [addVehicle]);

  const registerVehicleToBackend = useCallback(async (vehicleData: RegisterVehicleRequest): Promise<BackendVehicle | null> => {
    try {
      console.log('💾 백엔드에 차량 정보 등록 중...', vehicleData);
      const response = await registerVehicle(vehicleData);
      
      if (response.success && response.data) {
        console.log('✅ 백엔드 차량 등록 완료:', response.data);
        return response.data;
      } else {
        console.error('❌ 백엔드 차량 등록 실패:', response.error);
        return null;
      }
    } catch (error) {
      console.error('💥 백엔드 차량 등록 중 오류:', error);
      throw error;
    }
  }, []);

  return {
    vehicles,
    setVehicles,
    addVehicle,
    loadVehiclesFromBackend,
    searchVehicleByAPI,
    convertBackendVehicle,
    registerVehicleToBackend,
  };
};

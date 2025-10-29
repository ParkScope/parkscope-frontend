import { useState, useCallback } from 'react';
import { ParkingSpace, Vehicle, ParkingLot } from '../types';
import { getParkingSpacesStatus } from '../utils/apiClient';

export interface UseParkingSpacesReturn {
  parkingLots: ParkingLot[];
  setParkingLots: React.Dispatch<React.SetStateAction<ParkingLot[]>>;
  loadParkingSpacesStatus: () => Promise<void>;
  assignVehicleToSpace: (vehicle: Vehicle, apiLocation: string, floorName: string, parkingLots: ParkingLot[]) => {
    success: boolean;
    updatedLots: ParkingLot[] | null;
    targetSpace: ParkingSpace | null;
    lotId?: string;
    floorId?: string;
  };
}

export const useParkingSpaces = (initialLots: ParkingLot[] = []): UseParkingSpacesReturn => {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(initialLots);

  const loadParkingSpacesStatus = useCallback(async () => {
    try {
      const spacesResponse = await getParkingSpacesStatus();
      if (spacesResponse.success && spacesResponse.data) {
        setParkingLots(prevLots => {
          return prevLots.map(lot => ({
            ...lot,
            floors: lot.floors.map((floor) => ({
              ...floor,
              mapData: {
                ...floor.mapData,
                spaces: floor.mapData.spaces.map((space) => {
                  // 현재 층에 해당하는 백엔드 데이터만 찾기
                  const backendSpace = spacesResponse.data!.find((bs) => 
                    bs.spaceId === space.spaceNumber && 
                    bs.floorName === floor.name  // 층 정보로 정확히 매칭
                  );
                  
                  if (backendSpace) {
                    console.log(`✅ 층별 매칭 성공: ${floor.name} - ${space.spaceNumber} (차량: ${backendSpace.vehicleId || '없음'})`);
                    return {
                      ...space,
                      status: backendSpace.status,
                      vehicleId: backendSpace.vehicleId || undefined,
                    };
                  }
                  return space;
                })
              }
            }))
          }));
        });
        
        console.log('✅ 층 정보를 활용한 주차공간 상태 로드 완료');
      }
    } catch (error) {
      console.error('❌ 주차공간 상태 로드 실패:', error);
      throw error;
    }
  }, []);

  const assignVehicleToSpace = useCallback((
    vehicle: Vehicle, 
    apiLocation: string,
    floorName: string, 
    currentLots: ParkingLot[]
  ) => {
    console.log(`🎯 API에서 받은 위치: ${apiLocation}, 층: ${floorName}`);
    
    // 층 이름으로 해당 주차장과 층 찾기
    let targetLot: ParkingLot | undefined;
    let targetFloor: ParkingLot['floors'][0] | undefined;
    
    for (const lot of currentLots) {
      const floor = lot.floors.find(f => f.name === floorName);
      if (floor) {
        targetLot = lot;
        targetFloor = floor;
        break;
      }
    }
    
    if (!targetLot || !targetFloor) {
      console.warn(`❌ ${floorName} 층을 찾을 수 없음`);
      return {
        success: false,
        updatedLots: null,
        targetSpace: null,
      };
    }
    
    console.log(`� 대상 주차장: ${targetLot.name}, 층: ${targetFloor.name}`);
    
    // 정규화된 위치 계산 (O->0 변환 및 앞자리 0 제거)
    const normalizedApiLocation = apiLocation
      .toUpperCase()
      .replace(/O/g, '0')  // O를 0으로 변환 (BO5 -> B05)
      .replace(/^([A-Z])0+(\d+)$/, '$1$2'); // 앞의 0 제거 (B05 -> B5)
    
    console.log(`📍 정규화된 위치: ${normalizedApiLocation}`);
    
    // 정확한 매칭으로만 빈 공간 찾기
    const targetSpace = targetFloor.mapData.spaces.find((space: ParkingSpace) => {
      const normalizedSpace = space.spaceNumber
        .toUpperCase()
        .replace(/O/g, '0')
        .replace(/^([A-Z])0+(\d+)$/, '$1$2');
      const isMatch = normalizedSpace === normalizedApiLocation && space.status === "empty";
      
      if (isMatch) {
        console.log(`✅ 매칭된 공간: ${space.spaceNumber} -> ${normalizedSpace}`);
      }
      
      return isMatch;
    });
    
    // 정확한 공간을 찾지 못한 경우 실패 처리 (대체 공간 사용 안함)
    if (!targetSpace) {
      console.warn(`❌ ${apiLocation} (정규화: ${normalizedApiLocation}) 공간을 ${floorName}층에서 찾을 수 없거나 이미 점유됨`);
      
      return {
        success: false,
        updatedLots: null,
        targetSpace: null,
      };
    }
    
    console.log(`✅ 차량 배치 완료: ${vehicle.licensePlate} -> ${targetFloor.name} ${targetSpace.spaceNumber}`);
    
    // 먼저 기존에 동일한 차량이 배치된 곳이 있다면 제거
    const lotsWithRemovedVehicle = currentLots.map(lot => ({
      ...lot,
      floors: lot.floors.map(floor => ({
        ...floor,
        mapData: {
          ...floor.mapData,
          spaces: floor.mapData.spaces.map(space => {
            if (space.vehicleId === vehicle.id) {
              console.log(`🗑️ 기존 위치에서 차량 제거: ${lot.name} ${floor.name} ${space.spaceNumber}`);
              return {
                ...space,
                status: "empty" as const,
                vehicleId: undefined
              };
            }
            return space;
          })
        }
      }))
    }));
    
    // parkingLots 상태를 업데이트하여 주차공간에 차량 배치
    const updatedLots = lotsWithRemovedVehicle.map(lot => {
      if (lot.id === targetLot!.id) {
        return {
          ...lot,
          floors: lot.floors.map((floor) => {
            if (floor.id === targetFloor!.id) {
              return {
                ...floor,
                mapData: {
                  ...floor.mapData,
                  spaces: floor.mapData.spaces.map((space) => {
                    if (space.id === targetSpace.id) {
                      return {
                        ...space,
                        status: "occupied" as const,
                        vehicleId: vehicle.id
                      };
                    }
                    return space;
                  })
                }
              };
            }
            return floor;
          })
        };
      }
      return lot;
    });
    
    return {
      success: true,
      updatedLots,
      targetSpace,
      lotId: targetLot.id,
      floorId: targetFloor.id,
    };
  }, []);

  return {
    parkingLots,
    setParkingLots,
    loadParkingSpacesStatus,
    assignVehicleToSpace,
  };
};

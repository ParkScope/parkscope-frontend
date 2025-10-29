import { useState, useCallback } from 'react';
import { Vehicle, ParkingSpace, ParkingLot } from '../types';

export interface UseSearchReturn {
  searchResult: { vehicle: Vehicle; space: ParkingSpace } | null;
  highlightedVehicleId: string | null;
  searchMessage: string;
  isSearching: boolean;
  setSearchResult: React.Dispatch<React.SetStateAction<{ vehicle: Vehicle; space: ParkingSpace } | null>>;
  setHighlightedVehicleId: React.Dispatch<React.SetStateAction<string | null>>;
  setSearchMessage: React.Dispatch<React.SetStateAction<string>>;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
  searchVehicleInLots: (query: string, vehicles: Vehicle[], parkingLots: ParkingLot[]) => {
    found: boolean;
    result: { vehicle: Vehicle; space: ParkingSpace } | null;
    lotId?: string;
    floorId?: string;
  };
  clearSearch: () => void;
}

export const useSearch = (): UseSearchReturn => {
  const [searchResult, setSearchResult] = useState<{ vehicle: Vehicle; space: ParkingSpace } | null>(null);
  const [highlightedVehicleId, setHighlightedVehicleId] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const searchVehicleInLots = useCallback((
    query: string, 
    vehicles: Vehicle[], 
    parkingLots: ParkingLot[]
  ) => {
    console.log(`🔍 로컬 데이터에서 검색: "${query}"`);
    
    for (const lot of parkingLots) {
      for (const floor of lot.floors) {
        for (const space of floor.mapData.spaces) {
          const vehicle = vehicles.find((v) => v.id === space.vehicleId);
          if (vehicle && vehicle.licensePlate.includes(query)) {
            console.log(`✅ 로컬에서 차량 발견: ${vehicle.licensePlate}`);
            return {
              found: true,
              result: { vehicle, space },
              lotId: lot.id,
              floorId: floor.id,
            };
          }
        }
      }
    }
    
    console.log(`❌ 로컬에서 차량을 찾지 못함`);
    return {
      found: false,
      result: null,
    };
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResult(null);
    setHighlightedVehicleId(null);
    setSearchMessage("");
    setIsSearching(false);
  }, []);

  return {
    searchResult,
    highlightedVehicleId,
    searchMessage,
    isSearching,
    setSearchResult,
    setHighlightedVehicleId,
    setSearchMessage,
    setIsSearching,
    searchVehicleInLots,
    clearSearch,
  };
};

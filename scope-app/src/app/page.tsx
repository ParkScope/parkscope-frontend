"use client";
import React, { useState, useMemo, FC, useEffect, useCallback } from "react";
import {
  Search,
  Car,
  MapPin,
  Users,
  Clock,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Camera,
  ParkingCircle,
  Building,
  ChevronDown,
  X,
  Navigation,
  Wifi,
  DoorOpen,
  BarChart3,
  Menu,
} from "lucide-react";

import { Vehicle, ParkingSpace, BuildingEntrance, ParkingFloor, ParkingLot, StatsCardProps, ParkingLotSelectorProps, FloorSelectorProps, ParkingMapProps, SearchBarProps, VehicleInfoProps, CameraModalProps, EntranceSelectionModalProps } from "./types";

import { mockVehicles, mockParkingLots } from "./data/mockData";

import { calculatePath } from "./utils/pathCalculator";

// --- 컴포넌트 Props 타입 정의 ---
interface StatsCardProps {
  icon: React.ElementType;
  title: string;
  value: number | string;
  description: string;
  gradient: string;
}

interface ParkingLotSelectorProps {
  lots: ParkingLot[];
  selectedLotId: string;
  onLotChange: (lotId: string) => void;
}

interface FloorSelectorProps {
  floors: ParkingFloor[];
  selectedFloorId: string;
  onFloorChange: (floorId: string) => void;
}

interface ParkingMapProps {
  floor: ParkingFloor;
  vehicles: Vehicle[];
  highlightedVehicleId: string | null;
  onSpaceClick: (space: ParkingSpace) => void;
  navigationPath: { x: number; y: number }[] | null;
  animationProgress: number;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder: string;
}

interface VehicleInfoProps {
  vehicle: Vehicle;
  space: ParkingSpace;
  onViewCamera: (imageUrl: string) => void;
  onNavigate: () => void;
}

interface CameraModalProps {
  imageUrl: string;
  vehiclePlate: string;
  onClose: () => void;
}

interface EntranceSelectionModalProps {
  entrances: BuildingEntrance[];
  onSelectEntrance: (entrance: BuildingEntrance) => void;
  onClose: () => void;
}

import StatsCard from "./components/StatsCard";

import ParkingLotSelector from "./components/ParkingLotSelector";

import FloorSelector from "./components/FloorSelector";

import SearchBar from "./components/SearchBar";

import VehicleInfo from "./components/VehicleInfo";

import EntranceSelectionModal from "./components/EntranceSelectionModal";

import ParkingMap from "./components/ParkingMap";

const CameraModal: FC<CameraModalProps> = ({ imageUrl, vehiclePlate, onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div
      className="bg-white rounded-2xl relative max-w-4xl w-full max-h-[90vh] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            <h3 className="text-lg sm:text-xl font-bold">실시간 주차장 카메라</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Wifi className="w-4 h-4" />
          <span className="opacity-90">차량번호: {vehiclePlate}</span>
          <span className="opacity-90 ml-4">● LIVE</span>
        </div>
      </div>
      <div className="p-4">
        <img src={imageUrl} alt={`${vehiclePlate} 차량 실시간 카메라`} className="w-full rounded-xl" />
      </div>
    </div>
  </div>
);

// --- 메인 페이지 컴포넌트 ---
export default function SmartParkingSystem() {
  const [selectedLotId, setSelectedLotId] = useState<string>(mockParkingLots[0].id);
  const [selectedFloorId, setSelectedFloorId] = useState<string>(mockParkingLots[0].floors[0].id);
  const [searchResult, setSearchResult] = useState<{ vehicle: Vehicle; space: ParkingSpace } | null>(null);
  const [highlightedVehicleId, setHighlightedVehicleId] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState<string>("");
  const [cameraModalUrl, setCameraModalUrl] = useState<string | null>(null);
  const [cameraVehiclePlate, setCameraVehiclePlate] = useState<string>("");
  const [showEntranceModal, setShowEntranceModal] = useState<boolean>(false);
  const [navigationPath, setNavigationPath] = useState<{ x: number; y: number }[] | null>(null);
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const selectedLot = useMemo(() => mockParkingLots.find((lot) => lot.id === selectedLotId)!, [selectedLotId]);
  const selectedFloor = useMemo(
    () => selectedLot.floors.find((floor) => floor.id === selectedFloorId),
    [selectedLot, selectedFloorId]
  );

  // 애니메이션 효과 - 메모이제이션을 통한 성능 최적화
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

  useEffect(() => {
    const cleanup = startAnimation();
    return cleanup;
  }, [startAnimation]);

  const handleLotChange = useCallback((lotId: string) => {
    const newLot = mockParkingLots.find((lot) => lot.id === lotId)!;
    setSelectedLotId(lotId);
    setSelectedFloorId(newLot.floors[0].id);
    setSearchResult(null);
    setHighlightedVehicleId(null);
    setSearchMessage("");
    setNavigationPath(null);
  }, []);

  const lotStats = useMemo(() => {
    let totalSpots = 0;
    let occupiedSpots = 0;
    selectedLot.floors.forEach((floor) => {
      totalSpots += floor.mapData.spaces.length;
      occupiedSpots += floor.mapData.spaces.filter((s) => s.status === "occupied").length;
    });
    return { totalSpots, occupiedSpots, floorCount: selectedLot.floors.length };
  }, [selectedLot]);

  const handleSearch = useCallback(
    (query: string) => {
      let found = false;
      for (const lot of mockParkingLots) {
        for (const floor of lot.floors) {
          for (const space of floor.mapData.spaces) {
            const vehicle = mockVehicles.find((v) => v.id === space.vehicleId);
            if (vehicle && vehicle.licensePlate.includes(query)) {
              if (selectedLotId !== lot.id) {
                handleLotChange(lot.id);
              }
              setSelectedFloorId(floor.id);
              setSearchResult({ vehicle, space });
              setHighlightedVehicleId(vehicle.id);
              setSearchMessage("");
              setNavigationPath(null);
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (found) break;
      }
      if (!found) {
        setSearchResult(null);
        setHighlightedVehicleId(null);
        setSearchMessage(`'${query}' 차량을 찾을 수 없습니다.`);
        setNavigationPath(null);
      }
    },
    [selectedLotId, handleLotChange]
  );

  const handleSpaceClick = useCallback((space: ParkingSpace) => {
    if (space.vehicleId) {
      const vehicle = mockVehicles.find((v) => v.id === space.vehicleId)!;
      setSearchResult({ vehicle, space });
      setHighlightedVehicleId(vehicle.id);
      setNavigationPath(null);
    }
  }, []);

  const handleViewCamera = useCallback(
    (imageUrl: string) => {
      if (searchResult) {
        setCameraVehiclePlate(searchResult.vehicle.licensePlate);
      }
      setCameraModalUrl(imageUrl);
    },
    [searchResult]
  );

  const handleNavigate = useCallback(() => {
    setShowEntranceModal(true);
  }, []);

  const handleSelectEntrance = useCallback(
    (entrance: BuildingEntrance) => {
      if (searchResult && selectedFloor) {
        const targetSpace = searchResult.space;
        const targetPosition = {
          x: targetSpace.position.x + targetSpace.size.width / 2,
          y: targetSpace.position.y + targetSpace.size.height / 2,
        };

        const path = calculatePath(entrance.position, targetPosition);
        setNavigationPath(path);
        setAnimationProgress(0);
      }
      setShowEntranceModal(false);
    },
    [searchResult, selectedFloor]
  );

  if (!selectedFloor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">주차장 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {cameraModalUrl && (
        <CameraModal
          imageUrl={cameraModalUrl}
          vehiclePlate={cameraVehiclePlate}
          onClose={() => setCameraModalUrl(null)}
        />
      )}

      {showEntranceModal && selectedFloor && (
        <EntranceSelectionModal
          entrances={selectedFloor.mapData.entrances}
          onSelectEntrance={handleSelectEntrance}
          onClose={() => setShowEntranceModal(false)}
        />
      )}

      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-30 border-b border-white/20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl">
                <ParkingCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
                  AI 스마트 주차 관제 시스템
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:block">
                  ESP32-CAM 기반 실시간 주차 관리
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center text-sm text-gray-600 bg-white/50 px-4 py-2 rounded-xl">
                <Clock className="w-4 h-4 mr-2" />
                {new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
              </div>
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-2 sm:px-3 py-1 sm:py-2 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium">시스템 정상</span>
              </div>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-gray-600">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            icon={Building}
            title="선택된 주차장"
            value={selectedLot.name}
            description="현재 모니터링 중인 주차장"
            gradient="from-blue-500 to-blue-700"
          />
          <StatsCard
            icon={Layers}
            title="총 주차면"
            value={lotStats.totalSpots}
            description={`총 ${lotStats.floorCount}개 층 운영`}
            gradient="from-purple-500 to-purple-700"
          />
          <StatsCard
            icon={Users}
            title="주차중"
            value={lotStats.occupiedSpots}
            description={`이용률 ${Math.round((lotStats.occupiedSpots / lotStats.totalSpots) * 100) || 0}%`}
            gradient="from-red-500 to-red-700"
          />
          <StatsCard
            icon={Car}
            title="주차 가능"
            value={lotStats.totalSpots - lotStats.occupiedSpots}
            description="현재 이용 가능한 주차면"
            gradient="from-green-500 to-green-700"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* 사이드바 */}
          <aside className={`lg:col-span-1 space-y-4 sm:space-y-6 ${sidebarOpen ? "block" : "hidden lg:block"}`}>
            <ParkingLotSelector lots={mockParkingLots} selectedLotId={selectedLotId} onLotChange={handleLotChange} />
            <FloorSelector
              floors={selectedLot.floors}
              selectedFloorId={selectedFloorId}
              onFloorChange={setSelectedFloorId}
            />
            <SearchBar onSearch={handleSearch} placeholder="차량번호 입력 (예: 12가3456)" />

            {searchResult ? (
              <VehicleInfo
                vehicle={searchResult.vehicle}
                space={searchResult.space}
                onViewCamera={handleViewCamera}
                onNavigate={handleNavigate}
              />
            ) : (
              searchMessage && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 text-yellow-800 p-4 sm:p-6 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                    <div>
                      <p className="font-bold text-base sm:text-lg">검색 결과</p>
                      <p className="mt-1 text-sm sm:text-base">{searchMessage}</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </aside>

          {/* 메인 지도 */}
          <section className="lg:col-span-3">
            <ParkingMap
              floor={selectedFloor}
              vehicles={mockVehicles}
              highlightedVehicleId={highlightedVehicleId}
              onSpaceClick={handleSpaceClick}
              navigationPath={navigationPath}
              animationProgress={animationProgress}
            />
          </section>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
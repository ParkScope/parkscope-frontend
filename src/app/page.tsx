"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Car, Users, Clock, Layers, ParkingCircle, Building, Menu, X, RefreshCw } from "lucide-react";

import { Vehicle, ParkingSpace, BuildingEntrance } from "./types";

import { mockVehicles, mockParkingLots } from "./data/mockData";

import { calculatePath } from "./utils/pathCalculator";

import { getLatestResult } from "./utils/apiClient";
import { convertImageUrl } from "./utils/apiClient";

import StatsCard from "./components/StatsCard";

import ParkingLotSelector from "./components/ParkingLotSelector";

import FloorSelector from "./components/FloorSelector";

import SearchBar from "./components/SearchBar";

import VehicleInfo from "./components/VehicleInfo";

import EntranceSelectionModal from "./components/EntranceSelectionModal";

import ParkingMap from "./components/ParkingMap";

import CameraModal from "./components/CameraModal";

import RealTimeUpdate from "./components/RealTimeUpdate";

// --- 메인 페이지 컴포넌트 ---
export default function SmartParkingSystem() {
  const [parkingLots, setParkingLots] = useState(mockParkingLots);
  const [selectedLotId, setSelectedLotId] = useState<string>(parkingLots[0].id);
  const [selectedFloorId, setSelectedFloorId] = useState<string>(parkingLots[0].floors[0].id);
  const [searchResult, setSearchResult] = useState<{ vehicle: Vehicle; space: ParkingSpace } | null>(null);
  const [highlightedVehicleId, setHighlightedVehicleId] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState<string>("");
  const [cameraModalUrl, setCameraModalUrl] = useState<string | null>(null);
  const [cameraVehiclePlate, setCameraVehiclePlate] = useState<string>("");
  const [showEntranceModal, setShowEntranceModal] = useState<boolean>(false);
  const [navigationPath, setNavigationPath] = useState<{ x: number; y: number }[] | null>(null);
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  // API 관련 state
  const [realTimeActive, setRealTimeActive] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const selectedLot = useMemo(() => parkingLots.find((lot) => lot.id === selectedLotId)!, [selectedLotId, parkingLots]);
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
    const newLot = parkingLots.find((lot) => lot.id === lotId)!;
    setSelectedLotId(lotId);
    setSelectedFloorId(newLot.floors[0].id);
    setSearchResult(null);
    setHighlightedVehicleId(null);
    setSearchMessage("");
    setNavigationPath(null);
  }, [parkingLots]);

  const lotStats = useMemo(() => {
    let totalSpots = 0;
    let occupiedSpots = 0;
    selectedLot.floors.forEach((floor) => {
      totalSpots += floor.mapData.spaces.length;
      occupiedSpots += floor.mapData.spaces.filter((s) => s.status === "occupied").length;
    });
    return { totalSpots, occupiedSpots, floorCount: selectedLot.floors.length };
  }, [selectedLot]); // 원래대로 복원

  const handleSearch = useCallback(
    async (query: string) => {
      console.log(`🔍 검색 시작: "${query}"`);
      
      // 먼저 기존 로컬 데이터에서 검색
      let found = false;
      for (const lot of parkingLots) {
        for (const floor of lot.floors) {
          for (const space of floor.mapData.spaces) {
            const vehicle = vehicles.find((v) => v.id === space.vehicleId);
            if (vehicle && vehicle.licensePlate.includes(query)) {
              console.log(`✅ 로컬에서 차량 발견: ${vehicle.licensePlate}`);
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

      // 로컬 데이터에서 찾지 못한 경우, API 호출
      if (!found && query.trim()) {
        console.log(`🌐 로컬에서 찾지 못함. API 호출 시작...`);
        try {
          setIsSearching(true);
          setSearchMessage("ESP32-CAM API에서 차량 정보를 검색 중...");
          
          // 모든 차량번호에 대해 실제 ESP32-CAM API 호출
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
              licensePlate: query, // 입력된 차량번호 그대로 사용
              timestamp: new Date(response.data.created_at || new Date()),
              imageUrl: validImageUrl,
              confidence: response.data.confidence,
              isFromAPI: true,
            };

            // API 차량을 vehicles 배열에 추가 (중복 방지)
            setVehicles(prev => {
              const exists = prev.find(v => v.licensePlate === apiVehicle.licensePlate);
              if (!exists) {
                return [...prev, apiVehicle];
              }
              return prev;
            });

            // API에서 받은 실제 위치 정보로 주차공간 배치
            const firstLot = parkingLots[0];
            const firstFloor = firstLot.floors[0];
            
            let targetSpace;
            
            // API에서 받은 위치 정보로 주차공간 매핑
            const apiLocation = response.data.ocr_text.toUpperCase();
            console.log(`🎯 API에서 받은 위치: ${response.data.ocr_text} -> ${apiLocation}`);
            
            // 해당 위치의 주차공간 찾기 (빈 공간만)
            targetSpace = firstFloor.mapData.spaces.find(space => 
              space.spaceNumber === apiLocation && space.status === "empty"
            );
            
            console.log(`🅿️ 매핑된 주차공간:`, targetSpace ? `${targetSpace.spaceNumber} (${targetSpace.status})` : '없음');
            
            // API 위치를 찾지 못한 경우 처리
            if (!targetSpace) {
              const occupiedSpace = firstFloor.mapData.spaces.find(space => 
                space.spaceNumber === apiLocation
              );
              if (occupiedSpace && occupiedSpace.status === "occupied") {
                console.warn(`⚠️ ${apiLocation} 공간이 이미 점유됨. 대체 공간 찾는 중...`);
                targetSpace = firstFloor.mapData.spaces.find(space => space.status === "empty");
              } else {
                console.warn(`❌ ${apiLocation} 공간을 찾을 수 없음. 대체 공간 찾는 중...`);
                targetSpace = firstFloor.mapData.spaces.find(space => space.status === "empty");
              }
            }
            
            if (targetSpace) {
              console.log(`✅ 차량 배치 완료: ${query} -> ${targetSpace.spaceNumber}`);
              
              // parkingLots 상태를 업데이트하여 주차공간에 차량 배치
              setParkingLots(prevLots => {
                const newLots = prevLots.map(lot => {
                  if (lot.id === firstLot.id) {
                    return {
                      ...lot,
                      floors: lot.floors.map(floor => {
                        if (floor.id === firstFloor.id) {
                          return {
                            ...floor,
                            mapData: {
                              ...floor.mapData,
                              spaces: floor.mapData.spaces.map(space => {
                                if (space.id === targetSpace!.id) {
                                  return {
                                    ...space,
                                    status: "occupied" as const,
                                    vehicleId: apiVehicle.id
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
                return newLots;
              });
              
              setSelectedLotId(firstLot.id);
              setSelectedFloorId(firstFloor.id);
              setSearchResult({ vehicle: apiVehicle, space: targetSpace });
              setHighlightedVehicleId(apiVehicle.id);
              setSearchMessage(""); // 성공 시 메시지 지우기
              setNavigationPath(null);
              found = true; // 🔥 API 성공 시 found = true 설정
              console.log(`🎉 검색 성공! found = ${found}`);
            } else {
              console.error(`❌ 배치할 주차공간을 찾을 수 없음`);
              setSearchMessage("주차공간이 모두 사용중입니다.");
            }
          } else {
            console.error(`❌ API 실패:`, response.error);
            setSearchMessage(`ESP32-CAM API 오류: ${response.error || '데이터를 가져올 수 없습니다.'}`);
          }
        } catch (error) {
          console.error('💥 API 호출 실패:', error);
          setSearchMessage("ESP32-CAM API 호출 중 오류가 발생했습니다. API 서버가 실행 중인지 확인해주세요.");
        } finally {
          setIsSearching(false);
        }
      }

      // 🔥 최종 검사 - found가 false인 경우에만 오류 메시지
      console.log(`🏁 최종 검사: found = ${found}, query = "${query}"`);
      if (!found && query.trim()) {
        console.log(`❌ 최종적으로 차량을 찾지 못함`);
        setSearchResult(null);
        setHighlightedVehicleId(null);
        setSearchMessage(`'${query}' 차량을 찾을 수 없습니다.`);
        setNavigationPath(null);
      } else if (found) {
        console.log(`✅ 차량 검색 성공!`);
      }
    },
    [selectedLotId, handleLotChange, vehicles, parkingLots]
  );

  const handleSpaceClick = useCallback((space: ParkingSpace) => {
    if (space.vehicleId) {
      const vehicle = vehicles.find((v) => v.id === space.vehicleId)!;
      setSearchResult({ vehicle, space });
      setHighlightedVehicleId(vehicle.id);
      setNavigationPath(null);
    }
  }, [vehicles]);

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

  // 실시간 데이터 업데이트 핸들러
  const handleDataUpdate = useCallback((newVehicles: Vehicle[]) => {
    setVehicles(prev => [...prev, ...newVehicles]);
  }, []);

  // 실시간 업데이트 토글
  const toggleRealTimeUpdate = useCallback(() => {
    setRealTimeActive(prev => !prev);
  }, []);

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
            <ParkingLotSelector lots={parkingLots} selectedLotId={selectedLotId} onLotChange={handleLotChange} />
            <FloorSelector
              floors={selectedLot.floors}
              selectedFloorId={selectedFloorId}
              onFloorChange={setSelectedFloorId}
            />
            <SearchBar onSearch={handleSearch} placeholder="차량번호 입력 (모든 번호 검색 가능)" />

            {searchResult ? (
              <VehicleInfo
                vehicle={searchResult.vehicle}
                space={searchResult.space}
                onViewCamera={handleViewCamera}
                onNavigate={handleNavigate}
              />
            ) : (
              searchMessage && (
                <div className={`border-l-4 p-4 sm:p-6 rounded-2xl ${
                  isSearching 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 text-blue-800'
                    : searchMessage.includes('오류') || searchMessage.includes('찾을 수 없습니다')
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-400 text-red-800'
                    : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400 text-yellow-800'
                }`}>
                  <div className="flex items-center gap-3">
                    {isSearching ? (
                      <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 animate-spin" />
                    ) : searchMessage.includes('오류') || searchMessage.includes('찾을 수 없습니다') ? (
                      <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    ) : (
                      <Search className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-bold text-base sm:text-lg">
                        {isSearching ? 'API 검색 중...' : '검색 결과'}
                      </p>
                      <p className="mt-1 text-sm sm:text-base">{searchMessage}</p>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* 실시간 업데이트 컴포넌트 */}
            <RealTimeUpdate
              onDataUpdate={handleDataUpdate}
              isActive={realTimeActive}
            />

            {/* 실시간 업데이트 토글 버튼 */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
              <button
                onClick={toggleRealTimeUpdate}
                className={`w-full py-3 px-4 font-semibold rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base transition-colors ${
                  realTimeActive
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                }`}
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${realTimeActive ? 'animate-spin' : ''}`} />
                {realTimeActive ? '실시간 업데이트 중지' : '실시간 업데이트 시작'}
              </button>
            </div>
          </aside>

          {/* 메인 지도 */}
          <section className="lg:col-span-3">
            <ParkingMap
              floor={selectedFloor}
              vehicles={vehicles}
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

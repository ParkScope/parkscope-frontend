"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Car, Users, Clock, Layers, ParkingCircle, Building, Menu, X, RefreshCw } from "lucide-react";

import { Vehicle, ParkingSpace, BuildingEntrance } from "./types";
import { mockVehicles, mockParkingLots } from "./data/mockData";
import { calculatePath } from "./utils/pathCalculator";

import { 
  StatsCard,
  ParkingLotSelector,
  FloorSelector,
  SearchBar,
  VehicleInfo,
  EntranceSelectionModal,
  ParkingMap,
  CameraModal,
  RealTimeUpdate
} from "./components";

// 커스텀 훅
import { 
  useVehicleData, 
  useParkingSpaces, 
  useSearch, 
  useNavigation, 
  useCamera, 
  useUI,
  useFloorInfo
} from "./hooks";

// 비즈니스 로직 유틸리티
import { getLatestResult } from "./utils/apiClient";

// --- 메인 페이지 컴포넌트 ---
export default function SmartParkingSystem() {
  // 커스텀 훅들
  const vehicleHook = useVehicleData(mockVehicles);
  const parkingHook = useParkingSpaces(mockParkingLots);
  const searchHook = useSearch();
  const navigationHook = useNavigation();
  const cameraHook = useCamera();
  const uiHook = useUI();
  const floorInfoHook = useFloorInfo();

  // 주차장 선택 상태
  const [selectedLotId, setSelectedLotId] = useState<string>(parkingHook.parkingLots[0]?.id || '');
  const [selectedFloorId, setSelectedFloorId] = useState<string>(parkingHook.parkingLots[0]?.floors[0]?.id || '');

  // 계산된 값들
  const selectedLot = useMemo(() => 
    parkingHook.parkingLots.find((lot) => lot.id === selectedLotId)!,
    [selectedLotId, parkingHook.parkingLots]
  );
  
  const selectedFloor = useMemo(
    () => selectedLot?.floors.find((floor) => floor.id === selectedFloorId),
    [selectedLot, selectedFloorId]
  );

  const lotStats = useMemo(() => {
    if (!selectedLot) return { totalSpots: 0, occupiedSpots: 0, floorCount: 0 };
    
    let totalSpots = 0;
    let occupiedSpots = 0;
    selectedLot.floors.forEach((floor) => {
      totalSpots += floor.mapData.spaces.length;
      occupiedSpots += floor.mapData.spaces.filter((s) => s.status === "occupied").length;
    });
    return { totalSpots, occupiedSpots, floorCount: selectedLot.floors.length };
  }, [selectedLot]);

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await vehicleHook.loadVehiclesFromBackend();
        await parkingHook.loadParkingSpacesStatus();
        await floorInfoHook.loadLatestFloorInfo();
      } catch (error) {
        console.error('❌ 초기 데이터 로드 실패:', error);
      }
    };
    
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 애니메이션 효과
  useEffect(() => {
    const cleanup = navigationHook.startAnimation();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationHook.navigationPath]);

  // 주차장 변경 핸들러
  const handleLotChange = useCallback((lotId: string) => {
    const newLot = parkingHook.parkingLots.find((lot) => lot.id === lotId);
    if (newLot) {
      setSelectedLotId(lotId);
      setSelectedFloorId(newLot.floors[0].id);
      searchHook.clearSearch();
      navigationHook.setNavigationPath(null);
    }
  }, [parkingHook.parkingLots, searchHook, navigationHook]);

  // 검색 핸들러
  const handleSearch = useCallback(async (query: string) => {
    console.log(`🔍 검색 시작: "${query}"`);
    
    // 로컬 데이터에서 먼저 검색
    const localResult = searchHook.searchVehicleInLots(query, vehicleHook.vehicles, parkingHook.parkingLots);
    
    if (localResult.found && localResult.result) {
      if (localResult.lotId && selectedLotId !== localResult.lotId) {
        handleLotChange(localResult.lotId);
      }
      if (localResult.floorId) {
        setSelectedFloorId(localResult.floorId);
      }
      searchHook.setSearchResult(localResult.result);
      searchHook.setHighlightedVehicleId(localResult.result.vehicle.id);
      navigationHook.setNavigationPath(null);
      return;
    }

    // API로 검색 (로컬에서 찾지 못한 경우)
    if (!localResult.found && query.trim()) {
      try {
        searchHook.setIsSearching(true);
        searchHook.setSearchMessage("ESP32-CAM API에서 차량 정보를 검색 중...");
        
        const apiVehicle = await vehicleHook.searchVehicleByAPI(query);
        
        if (apiVehicle) {
          // 층 정보를 먼저 로드
          await floorInfoHook.loadLatestFloorInfo();
          
          // API 응답에서 위치 정보 가져오기
          const locationResponse = await getLatestResult();
          
          if (locationResponse.success && locationResponse.data && floorInfoHook.currentFloorInfo) {
            console.log(`🏢 층 정보: ${floorInfoHook.currentFloorInfo.floorName}`);
            
            const assignment = parkingHook.assignVehicleToSpace(
              apiVehicle, 
              locationResponse.data.ocr_text,
              floorInfoHook.currentFloorInfo.floorName, 
              parkingHook.parkingLots
            );
            
            if (assignment.success && assignment.updatedLots && assignment.targetSpace) {
              parkingHook.setParkingLots(assignment.updatedLots);
              
              // 백엔드에 차량 정보 저장
              try {
                const registerResult = await vehicleHook.registerVehicleToBackend({
                  licensePlate: apiVehicle.licensePlate,
                  parkingSpaceId: assignment.targetSpace.spaceNumber,
                  timestamp: apiVehicle.timestamp.toISOString(),
                  imageUrl: apiVehicle.imageUrl || "",
                  confidence: apiVehicle.confidence || 0,
                  ocrResultId: locationResponse.data._id
                });
                
                if (registerResult) {
                  console.log('✅ 차량 정보를 백엔드에 저장 완료');
                } else {
                  console.warn('⚠️ 차량 정보 백엔드 저장 실패');
                }
              } catch (error) {
                console.error('❌ 차량 정보 백엔드 저장 중 오류:', error);
              }
              
              // 배치된 주차장과 층으로 UI 업데이트
              if (assignment.lotId && assignment.floorId) {
                setSelectedLotId(assignment.lotId);
                setSelectedFloorId(assignment.floorId);
              }
              searchHook.setSearchResult({ vehicle: apiVehicle, space: assignment.targetSpace });
              searchHook.setHighlightedVehicleId(apiVehicle.id);
              searchHook.setSearchMessage("");
              navigationHook.setNavigationPath(null);
              return; // 성공 시 함수 종료
            } else {
              searchHook.setSearchMessage("주차공간이 모두 사용중입니다.");
            }
          }
        } else {
          searchHook.setSearchMessage("ESP32-CAM API에서 차량을 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error('💥 API 호출 실패:', error);
        searchHook.setSearchMessage("ESP32-CAM API 호출 중 오류가 발생했습니다.");
      } finally {
        searchHook.setIsSearching(false);
      }
      
      // API도 실패한 경우에만 최종 오류 메시지
      if (!searchHook.searchResult) {
        searchHook.setSearchMessage(`'${query}' 차량을 찾을 수 없습니다.`);
      }
    }
  }, [
    selectedLotId, 
    handleLotChange, 
    vehicleHook, 
    parkingHook, 
    searchHook, 
    navigationHook,
    floorInfoHook
  ]);

  // 주차공간 클릭 핸들러
  const handleSpaceClick = useCallback((space: ParkingSpace) => {
    if (space.vehicleId) {
      const vehicle = vehicleHook.vehicles.find((v) => v.id === space.vehicleId);
      if (vehicle) {
        searchHook.setSearchResult({ vehicle, space });
        searchHook.setHighlightedVehicleId(vehicle.id);
        navigationHook.setNavigationPath(null);
      }
    }
  }, [vehicleHook.vehicles, searchHook, navigationHook]);

  // 카메라 보기 핸들러
  const handleViewCamera = useCallback((imageUrl: string) => {
    if (searchHook.searchResult) {
      cameraHook.handleViewCamera(imageUrl, searchHook.searchResult.vehicle.licensePlate);
    } else {
      cameraHook.handleViewCamera(imageUrl);
    }
  }, [searchHook.searchResult, cameraHook]);

  // 입구 선택 핸들러
  const handleSelectEntrance = useCallback((entrance: BuildingEntrance) => {
    if (searchHook.searchResult && selectedFloor) {
      const targetSpace = searchHook.searchResult.space;
      const targetPosition = {
        x: targetSpace.position.x + targetSpace.size.width / 2,
        y: targetSpace.position.y + targetSpace.size.height / 2,
      };

      const path = calculatePath(entrance.position, targetPosition);
      navigationHook.setNavigationPath(path);
      navigationHook.setAnimationProgress(0);
    }
    navigationHook.setShowEntranceModal(false);
  }, [searchHook.searchResult, selectedFloor, navigationHook]);

  // 실시간 데이터 업데이트 핸들러
  const handleDataUpdate = useCallback((newVehicles: Vehicle[]) => {
    newVehicles.forEach(vehicle => vehicleHook.addVehicle(vehicle));
  }, [vehicleHook]);

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
      {/* 모달들 */}
      {cameraHook.cameraModalUrl && (
        <CameraModal
          imageUrl={cameraHook.cameraModalUrl}
          vehiclePlate={cameraHook.cameraVehiclePlate}
          onClose={() => cameraHook.setCameraModalUrl(null)}
        />
      )}

      {navigationHook.showEntranceModal && selectedFloor && (
        <EntranceSelectionModal
          entrances={selectedFloor.mapData.entrances}
          onSelectEntrance={handleSelectEntrance}
          onClose={() => navigationHook.setShowEntranceModal(false)}
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
              <button onClick={uiHook.toggleSidebar} className="lg:hidden p-2 text-gray-600">
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
          <aside className={`lg:col-span-1 space-y-4 sm:space-y-6 ${uiHook.sidebarOpen ? "block" : "hidden lg:block"}`}>
            <ParkingLotSelector 
              lots={parkingHook.parkingLots} 
              selectedLotId={selectedLotId} 
              onLotChange={handleLotChange} 
            />
            <FloorSelector
              floors={selectedLot.floors}
              selectedFloorId={selectedFloorId}
              onFloorChange={setSelectedFloorId}
            />
            <SearchBar onSearch={handleSearch} placeholder="차량번호 입력 (모든 번호 검색 가능)" />

            {/* 검색 결과 또는 메시지 */}
            {searchHook.searchResult ? (
              <VehicleInfo
                vehicle={searchHook.searchResult.vehicle}
                space={searchHook.searchResult.space}
                onViewCamera={handleViewCamera}
                onNavigate={navigationHook.handleNavigate}
              />
            ) : (
              searchHook.searchMessage && (
                <div className={`border-l-4 p-4 sm:p-6 rounded-2xl ${
                  searchHook.isSearching 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 text-blue-800'
                    : searchHook.searchMessage.includes('오류') || searchHook.searchMessage.includes('찾을 수 없습니다')
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-400 text-red-800'
                    : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400 text-yellow-800'
                }`}>
                  <div className="flex items-center gap-3">
                    {searchHook.isSearching ? (
                      <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 animate-spin" />
                    ) : searchHook.searchMessage.includes('오류') || searchHook.searchMessage.includes('찾을 수 없습니다') ? (
                      <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    ) : (
                      <Search className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-bold text-base sm:text-lg">
                        {searchHook.isSearching ? 'API 검색 중...' : '검색 결과'}
                      </p>
                      <p className="mt-1 text-sm sm:text-base">{searchHook.searchMessage}</p>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* 실시간 업데이트 컴포넌트 */}
            <RealTimeUpdate
              onDataUpdate={handleDataUpdate}
              isActive={uiHook.realTimeActive}
            />

            {/* 실시간 업데이트 토글 버튼 */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
              <button
                onClick={uiHook.toggleRealTimeUpdate}
                className={`w-full py-3 px-4 font-semibold rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base transition-colors ${
                  uiHook.realTimeActive
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                }`}
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${uiHook.realTimeActive ? 'animate-spin' : ''}`} />
                {uiHook.realTimeActive ? '실시간 업데이트 중지' : '실시간 업데이트 시작'}
              </button>
            </div>
          </aside>

          {/* 메인 지도 */}
          <section className="lg:col-span-3">
            <ParkingMap
              floor={selectedFloor}
              vehicles={vehicleHook.vehicles}
              highlightedVehicleId={searchHook.highlightedVehicleId}
              onSpaceClick={handleSpaceClick}
              navigationPath={navigationHook.navigationPath}
              animationProgress={navigationHook.animationProgress}
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

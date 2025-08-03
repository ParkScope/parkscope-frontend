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

// --- 타입 정의 ---
interface Vehicle {
  id: string;
  licensePlate: string;
  timestamp: Date;
  imageUrl?: string;
}

interface ParkingSpace {
  id: string;
  spaceNumber: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  status: "occupied" | "empty";
  vehicleId?: string;
}

interface BuildingEntrance {
  id: string;
  name: string;
  position: { x: number; y: number };
  type: "main" | "side" | "emergency";
}

interface ParkingFloor {
  id: string;
  name: string;
  mapData: {
    width: number;
    height: number;
    spaces: ParkingSpace[];
    entrances: BuildingEntrance[];
  };
}

interface ParkingLot {
  id: string;
  name: string;
  floors: ParkingFloor[];
}

// --- 현실적인 목업 데이터 생성 ---
const mockVehicles: Vehicle[] = [
  {
    id: "v1",
    licensePlate: "12가3456",
    timestamp: new Date("2024-08-03T10:30:00"),
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop",
  },
  {
    id: "v2",
    licensePlate: "78나9012",
    timestamp: new Date("2024-08-03T09:45:00"),
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
  },
  {
    id: "v3",
    licensePlate: "34다5678",
    timestamp: new Date("2024-08-03T11:15:00"),
    imageUrl: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600&fit=crop",
  },
  {
    id: "v4",
    licensePlate: "00아0000",
    timestamp: new Date("2024-08-03T12:00:00"),
    imageUrl: "https://images.unsplash.com/photo-1494976688153-d4cc4fc2bd6b?w=800&h=600&fit=crop",
  },
];

// 건물 입구 정의
const lotte_B1_Entrances: BuildingEntrance[] = [
  { id: "lotte_b1_main", name: "메인 입구", position: { x: 30, y: 350 }, type: "main" },
  { id: "lotte_b1_side1", name: "사이드 입구 A", position: { x: 850, y: 200 }, type: "side" },
  { id: "lotte_b1_side2", name: "사이드 입구 B", position: { x: 450, y: 30 }, type: "side" },
];

const lotte_B2_Entrances: BuildingEntrance[] = [
  { id: "lotte_b2_main", name: "메인 입구", position: { x: 30, y: 420 }, type: "main" },
  { id: "lotte_b2_side", name: "사이드 입구", position: { x: 850, y: 300 }, type: "side" },
];

const ipark_B1_Entrances: BuildingEntrance[] = [
  { id: "ipark_b1_main", name: "메인 입구", position: { x: 30, y: 300 }, type: "main" },
  { id: "ipark_b1_side1", name: "사이드 입구 A", position: { x: 1090, y: 150 }, type: "side" },
  { id: "ipark_b1_side2", name: "사이드 입구 B", position: { x: 560, y: 30 }, type: "side" },
];

// 주차 공간을 절차적으로 생성하는 함수
const generateParkingSpaces = (
  floorId: string,
  rows: number,
  cols: number,
  startX: number,
  startY: number,
  vehicleAssignments: { spaceIndex: number; vehicleId: string }[] = []
): ParkingSpace[] => {
  const spaces: ParkingSpace[] = [];
  const assignmentMap = new Map(vehicleAssignments.map((a) => [a.spaceIndex, a.vehicleId]));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const spaceIndex = r * cols + c;
      const spaceId = `${floorId}_${spaceIndex + 1}`;
      const spaceNumber = `${String.fromCharCode(65 + r)}${c + 1}`;

      const assignedVehicleId = assignmentMap.get(spaceIndex);
      const isOccupied = assignedVehicleId ? true : Math.random() < 0.45;

      spaces.push({
        id: spaceId,
        spaceNumber,
        position: { x: startX + c * 70, y: startY + r * 120 },
        size: { width: 60, height: 110 },
        status: assignedVehicleId ? "occupied" : isOccupied ? "occupied" : "empty",
        vehicleId: assignedVehicleId,
      });
    }
  }
  return spaces;
};

// 주차 공간 및 입구 정보가 포함된 층 데이터
const lotteTower_B1_Spaces = generateParkingSpaces("lotte_B1", 5, 12, 60, 60, [
  { spaceIndex: 15, vehicleId: "v1" },
  { spaceIndex: 32, vehicleId: "v2" },
]);
const lotteTower_B2_Spaces = generateParkingSpaces("lotte_B2", 6, 12, 60, 60, [{ spaceIndex: 25, vehicleId: "v3" }]);
const ipark_B1_Spaces = generateParkingSpaces("ipark_B1", 4, 15, 60, 60, [{ spaceIndex: 40, vehicleId: "v4" }]);

const mockParkingLots: ParkingLot[] = [
  {
    id: "lotteTower",
    name: "롯데타워 주차장",
    floors: [
      {
        id: "lotte_B1",
        name: "B1F",
        mapData: {
          width: 900,
          height: 720,
          spaces: lotteTower_B1_Spaces,
          entrances: lotte_B1_Entrances,
        },
      },
      {
        id: "lotte_B2",
        name: "B2F",
        mapData: {
          width: 900,
          height: 840,
          spaces: lotteTower_B2_Spaces,
          entrances: lotte_B2_Entrances,
        },
      },
    ],
  },
  {
    id: "iparkMall",
    name: "아이파크몰 주차장",
    floors: [
      {
        id: "ipark_B1",
        name: "B1F",
        mapData: {
          width: 1120,
          height: 600,
          spaces: ipark_B1_Spaces,
          entrances: ipark_B1_Entrances,
        },
      },
    ],
  },
];

// --- 길찾기 경로 계산 함수 ---
const calculatePath = (start: { x: number; y: number }, end: { x: number; y: number }): { x: number; y: number }[] => {
  const path = [];
  const steps = 20;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = start.x + (end.x - start.x) * t;
    const y = start.y + (end.y - start.y) * t + Math.sin(t * Math.PI) * 20;
    path.push({ x, y });
  }

  return path;
};

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

// --- 컴포넌트 구현 ---
const StatsCard: FC<StatsCardProps> = ({ icon: Icon, title, value, description, gradient }) => (
  <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-6 text-white bg-gradient-to-br ${gradient}`}>
    <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 opacity-10">
      <Icon className="w-full h-full" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <Icon className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
      </div>
      <p className="text-xs sm:text-sm opacity-80 font-medium">{title}</p>
      <p className="text-xl sm:text-3xl font-bold mt-1 mb-1 sm:mb-2">{value}</p>
      <p className="text-xs opacity-70">{description}</p>
    </div>
  </div>
);

const ParkingLotSelector: FC<ParkingLotSelectorProps> = ({ lots, selectedLotId, onLotChange }) => (
  <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
    <div className="flex items-center gap-3 mb-4">
      <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
      <h3 className="text-base sm:text-lg font-bold text-gray-800">주차장 선택</h3>
    </div>
    <div className="relative">
      <select
        value={selectedLotId}
        onChange={(e) => onLotChange(e.target.value)}
        className="w-full appearance-none bg-gray-50 border-2 border-gray-200 rounded-xl py-3 sm:py-4 px-4 pr-10 text-sm sm:text-base text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
      >
        {lots.map((lot) => (
          <option key={lot.id} value={lot.id}>
            {lot.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-blue-600 pointer-events-none" />
    </div>
  </div>
);

const FloorSelector: FC<FloorSelectorProps> = ({ floors, selectedFloorId, onFloorChange }) => (
  <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
    <div className="flex items-center gap-3 mb-4">
      <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
      <h3 className="text-base sm:text-lg font-bold text-gray-800">층별 현황</h3>
    </div>
    <div className="space-y-3">
      {floors.map((floor) => {
        const total = floor.mapData.spaces.length;
        const occupied = floor.mapData.spaces.filter((s) => s.status === "occupied").length;
        const occupancyRate = Math.round((occupied / total) * 100);
        const isSelected = selectedFloorId === floor.id;

        return (
          <button
            key={floor.id}
            onClick={() => onFloorChange(floor.id)}
            className={`w-full p-3 sm:p-4 rounded-xl text-left ${
              isSelected ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "bg-gray-50 text-gray-700"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-lg sm:text-xl">{floor.name}</span>
                <div className="text-xs sm:text-sm opacity-80 mt-1 flex items-center gap-2">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  주차율 {occupancyRate}%
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm sm:text-lg font-bold ${isSelected ? "text-white" : "text-gray-600"}`}>
                  {occupied}/{total}
                </div>
                <div className={`w-12 sm:w-16 h-2 rounded-full mt-1 ${isSelected ? "bg-white/30" : "bg-gray-300"}`}>
                  <div
                    className={`h-full rounded-full ${isSelected ? "bg-white" : "bg-red-400"}`}
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const SearchBar: FC<SearchBarProps> = ({ onSearch, placeholder }) => {
  const [query, setQuery] = useState("");
  const handleSearch = () => {
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">내 차 찾기</h2>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white font-semibold text-gray-800 placeholder-gray-500 text-sm sm:text-base"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl text-sm sm:text-base"
        >
          검색
        </button>
      </div>
    </div>
  );
};

const VehicleInfo: FC<VehicleInfoProps> = ({ vehicle, space, onViewCamera, onNavigate }) => (
  <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
    <div className="flex items-center gap-3 mb-4 sm:mb-6">
      <Car className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
      <h3 className="text-lg sm:text-xl font-bold text-gray-800">차량 정보</h3>
    </div>

    <div className="space-y-4 sm:space-y-5">
      <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3 mb-2">
          <Car className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">차량번호</span>
        </div>
        <p className="font-bold text-xl sm:text-2xl text-gray-800">{vehicle.licensePlate}</p>
      </div>

      <div className="p-3 sm:p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">주차위치</span>
        </div>
        <p className="font-bold text-lg sm:text-xl text-gray-800">{space.spaceNumber}번 구역</p>
      </div>

      <div className="p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-200">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">주차시간</span>
        </div>
        <p className="font-semibold text-sm sm:text-base text-gray-800">{vehicle.timestamp.toLocaleString("ko-KR")}</p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 mt-4 sm:mt-6">
      {vehicle.imageUrl && (
        <button
          onClick={() => onViewCamera(vehicle.imageUrl!)}
          className="w-full py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
          실시간 카메라 보기
        </button>
      )}
      <button
        onClick={onNavigate}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
        길찾기 시작
      </button>
    </div>
  </div>
);

const EntranceSelectionModal: FC<EntranceSelectionModalProps> = ({ entrances, onSelectEntrance, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div
      className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <DoorOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">입구 선택</h3>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500">
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="space-y-3">
        {entrances.map((entrance) => (
          <button
            key={entrance.id}
            onClick={() => onSelectEntrance(entrance)}
            className={`w-full p-3 sm:p-4 rounded-xl text-left border-2 ${
              entrance.type === "main"
                ? "border-blue-200 bg-blue-50 text-blue-800"
                : "border-gray-200 bg-gray-50 text-gray-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DoorOpen
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${entrance.type === "main" ? "text-blue-600" : "text-gray-500"}`}
                />
                <span className="font-semibold text-sm sm:text-base">{entrance.name}</span>
              </div>
              {entrance.type === "main" && (
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">추천</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const ParkingMap: FC<ParkingMapProps> = ({
  floor,
  vehicles,
  highlightedVehicleId,
  onSpaceClick,
  navigationPath,
  animationProgress,
}) => {
  const [zoom, setZoom] = useState(1);
  const statusColors = {
    empty: "fill-green-100 stroke-green-300",
    occupied: "fill-red-100 stroke-red-300",
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 h-full flex flex-col border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{floor.name} 주차장 도면</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(z * 1.3, 3))}
            className="p-2 sm:p-3 bg-gray-100 text-gray-700 rounded-xl border"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z * 0.7, 0.3))}
            className="p-2 sm:p-3 bg-gray-100 text-gray-700 rounded-xl border"
          >
            <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button onClick={() => setZoom(1)} className="p-2 sm:p-3 bg-gray-100 text-gray-700 rounded-xl border">
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-200 border border-green-300 rounded"></div>
          <span className="text-xs sm:text-sm font-medium text-gray-700">주차 가능</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-200 border border-red-300 rounded"></div>
          <span className="text-xs sm:text-sm font-medium text-gray-700">주차중</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 border-2 border-blue-600 rounded"></div>
          <span className="text-xs sm:text-sm font-medium text-gray-700">검색된 차량</span>
        </div>
        <div className="flex items-center gap-2">
          <DoorOpen className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-700">건물 입구</span>
        </div>
      </div>

      <div className="flex-grow border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
        <div className="w-full h-full overflow-auto">
          <svg width={floor.mapData.width * zoom} height={floor.mapData.height * zoom}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
              </marker>
            </defs>
            <g transform={`scale(${zoom})`}>
              {/* 주차 공간 렌더링 */}
              {floor.mapData.spaces.map((space) => {
                const vehicle = vehicles.find((v) => v.id === space.vehicleId);
                const isHighlighted = vehicle?.id === highlightedVehicleId;

                return (
                  <g key={space.id} onClick={() => onSpaceClick(space)} className="cursor-pointer">
                    <rect
                      x={space.position.x}
                      y={space.position.y}
                      width={space.size.width}
                      height={space.size.height}
                      className={statusColors[space.status]}
                      stroke={isHighlighted ? "#1D4ED8" : space.status === "occupied" ? "#EF4444" : "#10B981"}
                      strokeWidth={isHighlighted ? 4 : 2}
                      rx="6"
                      strokeDasharray={isHighlighted ? "10,5" : "none"}
                    />
                    <text
                      x={space.position.x + space.size.width / 2}
                      y={space.position.y + 20}
                      textAnchor="middle"
                      className="font-bold text-xs fill-gray-700 pointer-events-none"
                    >
                      {space.spaceNumber}
                    </text>
                    {isHighlighted && (
                      <Car
                        x={space.position.x + space.size.width / 2 - 12}
                        y={space.position.y + space.size.height / 2 - 12}
                        className="w-6 h-6 text-black pointer-events-none"
                      />
                    )}
                  </g>
                );
              })}

              {/* 건물 입구 렌더링 */}
              {floor.mapData.entrances.map((entrance) => (
                <g key={entrance.id}>
                  <circle
                    cx={entrance.position.x}
                    cy={entrance.position.y}
                    r="20"
                    fill={entrance.type === "main" ? "#8B5CF6" : "#6B7280"}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                  />
                  <DoorOpen
                    x={entrance.position.x - 8}
                    y={entrance.position.y - 8}
                    className="w-4 h-4 text-white pointer-events-none"
                  />
                  <text
                    x={entrance.position.x}
                    y={entrance.position.y + 35}
                    textAnchor="middle"
                    className="text-xs font-bold fill-gray-700"
                  >
                    {entrance.name}
                  </text>
                </g>
              ))}

              {/* 길찾기 경로 렌더링 */}
              {navigationPath && (
                <g>
                  <polyline
                    points={navigationPath.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="4"
                    strokeDasharray="10,5"
                    markerEnd="url(#arrowhead)"
                  />
                  {/* 애니메이션 포인트 */}
                  {navigationPath.length > 0 && (
                    <circle
                      cx={navigationPath[Math.floor(animationProgress * (navigationPath.length - 1))].x}
                      cy={navigationPath[Math.floor(animationProgress * (navigationPath.length - 1))].y}
                      r="8"
                      fill="#FFD700"
                      stroke="#FF6B35"
                      strokeWidth="2"
                    />
                  )}
                </g>
              )}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

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

"use client";
import React, { useState, useMemo, FC, useEffect, useCallback } from "react";
import {
  Search,
  Car,
  MapPin,
  Users,
  Clock,
  Layers,
  Camera,
  ParkingCircle,
  Building,
  ChevronDown,
  X,
  Navigation,
  Wifi,
  DoorOpen,
  BarChart3,
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

  // 직선 경로
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = start.x + (end.x - start.x) * t;
    const y = start.y + (end.y - start.y) * t;
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
const StatsCard: FC<StatsCardProps> = React.memo(({ icon: Icon, title, value, description, gradient }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${gradient}`}>
    <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
      <Icon className="w-full h-full" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-8 w-8 opacity-80" />
      </div>
      <p className="text-sm opacity-80 font-medium">{title}</p>
      <p className="text-3xl font-bold mt-1 mb-2">{value}</p>
      <p className="text-xs opacity-70">{description}</p>
    </div>
  </div>
));

const ParkingLotSelector: FC<ParkingLotSelectorProps> = React.memo(({ lots, selectedLotId, onLotChange }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-200">
    <div className="flex items-center gap-3 mb-4">
      <Building className="w-6 h-6 text-blue-600" />
      <h3 className="text-lg font-bold text-gray-800">주차장 선택</h3>
    </div>
    <div className="relative">
      <select
        value={selectedLotId}
        onChange={(e) => onLotChange(e.target.value)}
        className="w-full appearance-none bg-gray-50 border-2 border-gray-200 rounded-xl py-4 px-4 pr-10 text-gray-800 font-semibold focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400"
      >
        {lots.map((lot) => (
          <option key={lot.id} value={lot.id}>
            {lot.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-600 pointer-events-none" />
    </div>
  </div>
));

const FloorSelector: FC<FloorSelectorProps> = React.memo(({ floors, selectedFloorId, onFloorChange }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-200">
    <div className="flex items-center gap-3 mb-4">
      <Layers className="w-6 h-6 text-purple-600" />
      <h3 className="text-lg font-bold text-gray-800">층별 현황</h3>
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
            className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
              isSelected
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-xl">{floor.name}</span>
                <div className="text-sm opacity-80 mt-1 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  주차율 {occupancyRate}%
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${isSelected ? "text-white" : "text-gray-600"}`}>
                  {occupied}/{total}
                </div>
                <div className={`w-16 h-2 rounded-full mt-1 ${isSelected ? "bg-white/30" : "bg-gray-300"}`}>
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
));

const SearchBar: FC<SearchBarProps> = React.memo(({ onSearch, placeholder }) => {
  const [query, setQuery] = useState("");
  const handleSearch = () => {
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Search className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-bold text-gray-800">내 차 찾기</h2>
      </div>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white font-semibold text-gray-800 placeholder-gray-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl transition-transform duration-200 hover:scale-105"
        >
          검색
        </button>
      </div>
    </div>
  );
});

const VehicleInfo: FC<VehicleInfoProps> = React.memo(({ vehicle, space, onViewCamera, onNavigate }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-200">
    <div className="flex items-center gap-3 mb-6">
      <Car className="w-6 h-6 text-blue-600" />
      <h3 className="text-xl font-bold text-gray-800">차량 정보</h3>
    </div>

    <div className="space-y-5">
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3 mb-2">
          <Car className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-600">차량번호</span>
        </div>
        <p className="font-bold text-2xl text-gray-800">{vehicle.licensePlate}</p>
      </div>

      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-gray-600">주차위치</span>
        </div>
        <p className="font-bold text-xl text-gray-800">{space.spaceNumber}번 구역</p>
      </div>

      <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-medium text-gray-600">주차시간</span>
        </div>
        <p className="font-semibold text-gray-800">{vehicle.timestamp.toLocaleString("ko-KR")}</p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 mt-6">
      {vehicle.imageUrl && (
        <button
          onClick={() => onViewCamera(vehicle.imageUrl!)}
          className="w-full py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-105"
        >
          <Camera className="w-5 h-5" />
          실시간 카메라 보기
        </button>
      )}
      <button
        onClick={onNavigate}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-105"
      >
        <Navigation className="w-5 h-5" />
        길찾기 시작
      </button>
    </div>
  </div>
));

const EntranceSelectionModal: FC<EntranceSelectionModalProps> = React.memo(({ entrances, onSelectEntrance, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <DoorOpen className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">입구 선택</h3>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-3">
        {entrances.map((entrance) => (
          <button
            key={entrance.id}
            onClick={() => onSelectEntrance(entrance)}
            className={`w-full p-4 rounded-xl text-left border-2 transition-all duration-200 ${
              entrance.type === "main"
                ? "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 hover:border-blue-300"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DoorOpen className={`w-5 h-5 ${entrance.type === "main" ? "text-blue-600" : "text-gray-500"}`} />
                <span className="font-semibold">{entrance.name}</span>
              </div>
              {entrance.type === "main" && (
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-semibold">추천</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
));

const ParkingMap: FC<ParkingMapProps> = ({ floor, vehicles, highlightedVehicleId, onSpaceClick, navigationPath, animationProgress }) => {
  const statusColors = {
    empty: "fill-green-100 stroke-green-300",
    occupied: "fill-red-100 stroke-red-300",
  };

  return (
    <div className="bg-white rounded-2xl p-6 h-full flex flex-col border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{floor.name} 주차장 도면</h2>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
          <span className="text-sm font-medium text-gray-700">주차 가능</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
          <span className="text-sm font-medium text-gray-700">주차중</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 border-2 border-blue-600 rounded"></div>
          <span className="text-sm font-medium text-gray-700">검색된 차량</span>
        </div>
        <div className="flex items-center gap-2">
          <DoorOpen className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">건물 입구</span>
        </div>
      </div>

      <div className="flex-grow border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
        <div className="w-full h-full overflow-auto">
          <svg viewBox={`0 0 ${floor.mapData.width} ${floor.mapData.height}`} className="w-full h-full">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
              </marker>
            </defs>
            <g>
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
                  {navigationPath.length > 0 && (
                    <circle
                      cx={navigationPath[Math.floor(animationProgress * (navigationPath.length - 1))].x}
                      cy={navigationPath[Math.floor(animationProgress * (navigationPath.length - 1))].y}
                      r="8"
                      fill="#FFD700"
                      stroke="#FF6B35"
                      strokeWidth="2"
                      className="animate-pulse"
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

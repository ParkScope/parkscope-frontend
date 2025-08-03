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

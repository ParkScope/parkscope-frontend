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

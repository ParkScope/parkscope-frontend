interface Vehicle {
  id: string;
  licensePlate: string;
  timestamp: Date;
  imageUrl?: string;
  confidence?: number; // OCR 인식 신뢰도 (0-1)
  isFromAPI?: boolean; // API에서 가져온 데이터인지 구분
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

// ESP32-CAM API 관련 타입 정의
interface OCRResult {
  _id: string;
  filename: string;
  ocr_text: string; // 인식된 번호판 텍스트
  confidence: number;
  processing_ms: number;
  date_tag: string;
  created_at: string;
  json_path: string;
  photo_url: string;
}

interface APIResponseWrapper<T> {
  status: string;
  data: T;
}

interface ParkingStatistics {
  total_spaces: number;
  occupied_spaces: number;
  available_spaces: number;
  occupancy_rate: number;
  last_updated: string;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RealTimeUpdateProps {
  onDataUpdate: (vehicles: Vehicle[]) => void;
  isActive: boolean;
}

// --- 백엔드 API 응답 타입 정의 ---
interface BackendVehicle {
  licensePlate: string;
  parkingSpaceId: string;
  timestamp: string;
  imageUrl: string;
  confidence: number;
  ocrResultId: string;
  id: string;
  isActive: boolean;
}

interface BackendParkingSpace {
  spaceId: string;
  status: "empty" | "occupied";
  vehicleId: string | null;
  lastUpdated: string;
}

interface RegisterVehicleRequest {
  licensePlate: string;
  parkingSpaceId: string;
  timestamp: string;
  imageUrl: string;
  confidence: number;
  ocrResultId: string;
}

export type {
  Vehicle,
  ParkingSpace,
  BuildingEntrance,
  ParkingFloor,
  ParkingLot,
  StatsCardProps,
  ParkingLotSelectorProps,
  FloorSelectorProps,
  ParkingMapProps,
  SearchBarProps,
  VehicleInfoProps,
  CameraModalProps,
  EntranceSelectionModalProps,
  OCRResult,
  ParkingStatistics,
  APIResponse,
  APIResponseWrapper,
  RealTimeUpdateProps,
  BackendVehicle,
  BackendParkingSpace,
  RegisterVehicleRequest,
};

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

export type { Vehicle, ParkingSpace, BuildingEntrance, ParkingFloor, ParkingLot, StatsCardProps, ParkingLotSelectorProps, FloorSelectorProps, ParkingMapProps, SearchBarProps, VehicleInfoProps, CameraModalProps, EntranceSelectionModalProps };
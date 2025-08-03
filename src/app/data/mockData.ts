import { Vehicle, ParkingSpace, BuildingEntrance, ParkingLot } from "../types";

export const mockVehicles: Vehicle[] = [
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
export const lotte_B1_Entrances: BuildingEntrance[] = [
  { id: "lotte_b1_main", name: "메인 입구", position: { x: 30, y: 350 }, type: "main" },
  { id: "lotte_b1_side1", name: "사이드 입구 A", position: { x: 850, y: 200 }, type: "side" },
  { id: "lotte_b1_side2", name: "사이드 입구 B", position: { x: 450, y: 30 }, type: "side" },
];

export const lotte_B2_Entrances: BuildingEntrance[] = [
  { id: "lotte_b2_main", name: "메인 입구", position: { x: 30, y: 420 }, type: "main" },
  { id: "lotte_b2_side", name: "사이드 입구", position: { x: 850, y: 300 }, type: "side" },
];

export const ipark_B1_Entrances: BuildingEntrance[] = [
  { id: "ipark_b1_main", name: "메인 입구", position: { x: 30, y: 300 }, type: "main" },
  { id: "ipark_b1_side1", name: "사이드 입구 A", position: { x: 1090, y: 150 }, type: "side" },
  { id: "ipark_b1_side2", name: "사이드 입구 B", position: { x: 560, y: 30 }, type: "side" },
];

// 주차 공간을 절차적으로 생성하는 함수
export const generateParkingSpaces = (
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

export const mockParkingLots: ParkingLot[] = [
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
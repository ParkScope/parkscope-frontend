import { Vehicle, ParkingSpace, BuildingEntrance, ParkingLot } from "../types";

export const mockVehicles: Vehicle[] = [
  // 시연용: 처음에는 빈 배열로 시작
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
      // 시연용: 할당된 차량만 점유하고 나머지는 모두 빈 공간
      const isOccupied = assignedVehicleId ? true : false;

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

// 주차 공간 및 입구 정보가 포함된 층 데이터 (시연용: 초기에는 모든 공간이 비어있음)
const lotteTower_B1_Spaces = generateParkingSpaces("lotte_B1", 5, 12, 60, 60, []);
const lotteTower_B2_Spaces = generateParkingSpaces("lotte_B2", 6, 12, 60, 60, []);
const ipark_B1_Spaces = generateParkingSpaces("ipark_B1", 4, 15, 60, 60, []);

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
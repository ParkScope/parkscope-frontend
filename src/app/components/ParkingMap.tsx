import React, { useState } from "react";
import { Layers, ZoomIn, ZoomOut, RotateCcw, Car, DoorOpen } from "lucide-react";
import { ParkingMapProps } from "../types";

const ParkingMap: React.FC<ParkingMapProps> = ({
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

export default ParkingMap;
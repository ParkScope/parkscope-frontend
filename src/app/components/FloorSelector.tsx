import React from "react";
import { Layers, BarChart3 } from "lucide-react";
import { FloorSelectorProps } from "../types";

const FloorSelector: React.FC<FloorSelectorProps> = ({ floors, selectedFloorId, onFloorChange }) => (
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

export default FloorSelector;
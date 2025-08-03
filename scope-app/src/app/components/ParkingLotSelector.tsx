import React from "react";
import { ChevronDown, Building } from "lucide-react";
import { ParkingLotSelectorProps } from "../types";

const ParkingLotSelector: React.FC<ParkingLotSelectorProps> = ({ lots, selectedLotId, onLotChange }) => (
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

export default ParkingLotSelector;
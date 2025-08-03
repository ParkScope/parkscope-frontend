import React from "react";
import { X, DoorOpen } from "lucide-react";
import { EntranceSelectionModalProps } from "../types";

const EntranceSelectionModal: React.FC<EntranceSelectionModalProps> = ({ entrances, onSelectEntrance, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div
      className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <DoorOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">입구 선택</h3>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500">
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="space-y-3">
        {entrances.map((entrance) => (
          <button
            key={entrance.id}
            onClick={() => onSelectEntrance(entrance)}
            className={`w-full p-3 sm:p-4 rounded-xl text-left border-2 ${
              entrance.type === "main"
                ? "border-blue-200 bg-blue-50 text-blue-800"
                : "border-gray-200 bg-gray-50 text-gray-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DoorOpen
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${entrance.type === "main" ? "text-blue-600" : "text-gray-500"}`}
                />
                <span className="font-semibold text-sm sm:text-base">{entrance.name}</span>
              </div>
              {entrance.type === "main" && (
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">추천</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default EntranceSelectionModal;
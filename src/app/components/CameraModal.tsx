import React from "react";
import { Camera, X, Wifi } from "lucide-react";
import { CameraModalProps } from "../types";

const CameraModal: React.FC<CameraModalProps> = ({ imageUrl, vehiclePlate, onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div
      className="bg-white rounded-2xl relative max-w-4xl w-full max-h-[90vh] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            <h3 className="text-lg sm:text-xl font-bold">실시간 주차장 카메라</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Wifi className="w-4 h-4" />
          <span className="opacity-90">차량번호: {vehiclePlate}</span>
          <span className="opacity-90 ml-4">● LIVE</span>
        </div>
      </div>
      <div className="p-4">
        <img src={imageUrl} alt={`${vehiclePlate} 차량 실시간 카메라`} className="w-full rounded-xl" />
      </div>
    </div>
  </div>
);

export default CameraModal;
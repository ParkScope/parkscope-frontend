import React from "react";
import { Car, MapPin, Clock, Camera, Navigation } from "lucide-react";
import { VehicleInfoProps } from "../types";

const VehicleInfo: React.FC<VehicleInfoProps> = ({ vehicle, space, onViewCamera, onNavigate }) => (
  <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
    <div className="flex items-center gap-3 mb-4 sm:mb-6">
      <Car className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
      <h3 className="text-lg sm:text-xl font-bold text-gray-800">차량 정보</h3>
    </div>

    <div className="space-y-4 sm:space-y-5">
      <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3 mb-2">
          <Car className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">차량번호</span>
        </div>
        <p className="font-bold text-xl sm:text-2xl text-gray-800">{vehicle.licensePlate}</p>
      </div>

      <div className="p-3 sm:p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">주차위치</span>
        </div>
        <p className="font-bold text-lg sm:text-xl text-gray-800">{space.spaceNumber}번 구역</p>
      </div>

      <div className="p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-200">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">주차시간</span>
        </div>
        <p className="font-semibold text-sm sm:text-base text-gray-800">{vehicle.timestamp.toLocaleString("ko-KR")}</p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 mt-4 sm:mt-6">
      {vehicle.imageUrl && (
        <button
          onClick={() => onViewCamera(vehicle.imageUrl!)}
          className="w-full py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
          실시간 카메라 보기
        </button>
      )}
      <button
        onClick={onNavigate}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
        길찾기 시작
      </button>
    </div>
  </div>
);

export default VehicleInfo;
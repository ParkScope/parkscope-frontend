import React from "react";
import { Car, MapPin, Clock, Camera, Navigation, Wifi, Database, CheckCircle, AlertCircle } from "lucide-react";
import { VehicleInfoProps } from "../types";

const VehicleInfo: React.FC<VehicleInfoProps> = ({ vehicle, space, onViewCamera, onNavigate }) => (
  <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
    <div className="flex items-center gap-3 mb-4 sm:mb-6">
      <Car className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
      <h3 className="text-lg sm:text-xl font-bold text-gray-800">차량 정보</h3>
      {vehicle.isFromAPI && (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <Wifi className="w-3 h-3" />
          실시간
        </div>
      )}
    </div>

    <div className="space-y-4 sm:space-y-5">
      <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Car className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-600">차량번호</span>
          </div>
          {vehicle.isFromAPI && vehicle.confidence !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              {vehicle.confidence >= 0.9 ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <AlertCircle className="w-3 h-3 text-orange-600" />
              )}
              <span className={`font-medium ${vehicle.confidence >= 0.9 ? "text-green-600" : "text-orange-600"}`}>
                {Math.round(vehicle.confidence * 100)}%
              </span>
            </div>
          )}
        </div>
        <p className="font-bold text-xl sm:text-2xl text-gray-800">{vehicle.licensePlate}</p>
        {vehicle.isFromAPI && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-200">
            <Database className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-blue-600 font-medium">ESP32-CAM OCR 인식</span>
          </div>
        )}
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
        <div className="space-y-1">
          <p className="font-semibold text-sm sm:text-base text-gray-800">
            {vehicle.timestamp.toLocaleString("ko-KR")}
          </p>
          {vehicle.isFromAPI && <p className="text-xs text-orange-600 font-medium">실시간 업데이트</p>}
        </div>
      </div>

      {/* API 상세 정보 섹션 */}
      {vehicle.isFromAPI && (
        <div className="p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-600">인식 정보</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">ESP32-CAM 인식률</span>
              <div className="flex items-center gap-1">
                {vehicle.confidence !== undefined && vehicle.confidence >= 0.9 ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-orange-600" />
                )}
                <span
                  className={`text-xs font-semibold ${
                    vehicle.confidence !== undefined && vehicle.confidence >= 0.9 ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {vehicle.confidence !== undefined ? `${Math.round(vehicle.confidence * 100)}%` : "N/A"}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">데이터 소스</span>
              <span className="text-xs font-semibold text-purple-600">ESP32-CAM OCR</span>
            </div>
          </div>
        </div>
      )}
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

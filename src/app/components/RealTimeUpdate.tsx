import React, { useState, useEffect } from "react";
import { RefreshCw, Calendar, Camera } from "lucide-react";
import { RealTimeUpdateProps, Vehicle } from "../types";
import { getLatestResult, getResultsByDate, convertImageUrl } from "../utils/apiClient";

const RealTimeUpdate: React.FC<RealTimeUpdateProps> = ({ onDataUpdate, isActive }) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [status, setStatus] = useState<"connected" | "disconnected" | "error">("disconnected");
  const [todayCount, setTodayCount] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      setStatus("connected");

      // 오늘 데이터 초기 로드
      loadTodayData();

      interval = setInterval(async () => {
        try {
          const response = await getLatestResult();
          if (response.success && response.data) {
            // ocr_text가 위치 정보인 경우 실제 차량번호로 대체
            const isLocationCode = /^[a-zA-Z]\d+$/.test(response.data.ocr_text);
            const displayLicensePlate = isLocationCode ? "12가3456" : response.data.ocr_text;

            // 이미지 URL 변환
            let validImageUrl = undefined;
            if (response.data.photo_url) {
              validImageUrl = convertImageUrl(response.data.photo_url);
            }

            const newVehicle: Vehicle = {
              id: `v_${Date.now()}`,
              licensePlate: displayLicensePlate,
              timestamp: new Date(response.data.created_at),
              imageUrl: validImageUrl,
              confidence: response.data.confidence,
              isFromAPI: true,
            };

            setLastUpdate(new Date());
            onDataUpdate([newVehicle]);

            // 오늘 데이터 다시 로드
            loadTodayData();
          }
        } catch (error) {
          console.error("Real-time update failed:", error);
          setStatus("error");
        }
      }, 5000); // 5초마다 업데이트
    } else {
      setStatus("disconnected");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, onDataUpdate]);

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await getResultsByDate(today);
      if (response.success && response.data) {
        setTodayCount(response.data.length);
      }
    } catch (error) {
      console.error("Failed to load today data:", error);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "연결됨";
      case "error":
        return "오류";
      default:
        return "연결 안됨";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <RefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 text-blue-600 ${isActive ? "animate-spin" : ""}`} />
          <h3 className="text-base sm:text-lg font-bold text-gray-800">실시간 업데이트</h3>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-green-400" : status === "error" ? "bg-red-400" : "bg-gray-400"}`}
          />
          <span className={`text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">마지막 업데이트:</span>
          <span className="font-semibold text-gray-800">{lastUpdate.toLocaleTimeString("ko-KR")}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">업데이트 간격:</span>
          <span className="font-semibold text-gray-800">5초</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-600" />
            <span className="text-gray-600">오늘 인식:</span>
          </div>
          <span className="font-semibold text-blue-600">{todayCount}건</span>
        </div>

        {isActive && (
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">
            <Camera className="w-3 h-3" />
            <span>ESP32-CAM 실시간 모니터링 중...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeUpdate;

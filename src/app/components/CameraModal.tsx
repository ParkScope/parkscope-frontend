import React, { useState, useEffect } from "react";
import { Camera, X, Wifi, AlertCircle, RefreshCw } from "lucide-react";
import { CameraModalProps } from "../types";

const CameraModal: React.FC<CameraModalProps> = ({ imageUrl, vehiclePlate, onClose }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

  // props의 imageUrl이 변경되면 currentImageUrl도 업데이트
  useEffect(() => {
    setCurrentImageUrl(imageUrl);
    setImageLoading(true);
    setImageError(false);
    setRetryCount(0);
  }, [imageUrl]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleRetry = () => {
    setImageLoading(true);
    setImageError(false);
    setRetryCount(prev => prev + 1);
    // 캐시 방지를 위해 URL에 타임스탬프 추가 (재시도 시에만)
    setCurrentImageUrl(`${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`);
  };

  return (
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
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Wifi className="w-4 h-4" />
            <span className="opacity-90">차량번호: {vehiclePlate}</span>
            <span className="opacity-90 ml-4">● LIVE</span>
          </div>
        </div>
        <div className="p-4 min-h-[300px] flex items-center justify-center">
          {imageLoading && !imageError && (
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-gray-600">이미지를 불러오는 중...</p>
            </div>
          )}
          
          {imageError && (
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-orange-500" />
              <div>
                <p className="text-gray-800 font-semibold mb-2">이미지를 불러올 수 없습니다</p>
                <p className="text-gray-600 text-sm mb-4">
                  ESP32-CAM 이미지가 아직 준비되지 않았습니다.
                </p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  다시 시도 ({retryCount + 1})
                </button>
              </div>
            </div>
          )}
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={currentImageUrl} 
            alt={`${vehiclePlate} 차량 실시간 카메라`}
            className={`w-full rounded-xl transition-opacity ${imageLoading || imageError ? 'hidden' : 'block'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            key={retryCount} // 재시도 시 컴포넌트 리렌더링을 위한 key
          />
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
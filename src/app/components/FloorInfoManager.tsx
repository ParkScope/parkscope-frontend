import React, { useState } from 'react';
import { Building, Save, RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useFloorInfo } from '../hooks/useFloorInfo';

interface FloorInfoManagerProps {
  onFloorInfoUpdate?: (floorInfo: any) => void;
}

const FloorInfoManager: React.FC<FloorInfoManagerProps> = ({ onFloorInfoUpdate }) => {
  const { 
    currentFloorInfo, 
    isLoading, 
    error, 
    saveFloorInfo, 
    loadLatestFloorInfo, 
    clearError 
  } = useFloorInfo();

  const [floorName, setFloorName] = useState<string>('');
  const [sourceFile, setSourceFile] = useState<string>('');
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);

  const handleSaveFloorInfo = async () => {
    if (!floorName.trim() || !sourceFile.trim()) {
      alert('층 이름과 소스 파일을 모두 입력해주세요.');
      return;
    }

    const success = await saveFloorInfo({
      floorName: floorName.trim(),
      sourceFile: sourceFile.trim(),
    });

    if (success) {
      setFloorName('');
      setSourceFile('');
      setShowSaveForm(false);
      if (onFloorInfoUpdate && currentFloorInfo) {
        onFloorInfoUpdate(currentFloorInfo);
      }
    }
  };

  const handleLoadLatest = async () => {
    await loadLatestFloorInfo();
    if (currentFloorInfo && onFloorInfoUpdate) {
      onFloorInfoUpdate(currentFloorInfo);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Building className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">층 정보 관리</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLoadLatest}
            disabled={isLoading}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="최신 층 정보 로드"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="새 층 정보 저장"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 현재 층 정보 표시 */}
      {currentFloorInfo && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">현재 층 정보</span>
          </div>
          <div className="space-y-1 text-sm">
            <div><span className="font-medium">층 이름:</span> {currentFloorInfo.floorName}</div>
            <div><span className="font-medium">상태:</span> {currentFloorInfo.status}</div>
            <div><span className="font-medium">생성 시간:</span> {new Date(currentFloorInfo.created_at).toLocaleString('ko-KR')}</div>
          </div>
        </div>
      )}

      {/* 층 정보 저장 폼 */}
      {showSaveForm && (
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              층 이름
            </label>
            <input
              type="text"
              value={floorName}
              onChange={(e) => setFloorName(e.target.value)}
              placeholder="예: B1층, 1층, 2층..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              소스 파일
            </label>
            <input
              type="text"
              value={sourceFile}
              onChange={(e) => setSourceFile(e.target.value)}
              placeholder="예: floor_b1.json, layout_1f.xml..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowSaveForm(false);
                setFloorName('');
                setSourceFile('');
                clearError();
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSaveFloorInfo}
              disabled={isLoading || !floorName.trim() || !sourceFile.trim()}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              저장
            </button>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && !showSaveForm && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">층 정보 처리 중...</span>
        </div>
      )}

      {/* 초기 상태 */}
      {!currentFloorInfo && !isLoading && !error && (
        <div className="text-center py-8 text-gray-500">
          <Building className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>층 정보가 없습니다.</p>
          <p className="text-sm">최신 정보를 로드하거나 새로 저장해보세요.</p>
        </div>
      )}
    </div>
  );
};

export default FloorInfoManager;

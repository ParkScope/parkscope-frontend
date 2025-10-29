// ESP32-CAM API 클라이언트
import { APIResponse, OCRResult, BackendVehicle, BackendParkingSpace, RegisterVehicleRequest, FloorSaveRequest, BackendFloorInfo } from "../types";

// 환경 변수에서 설정값 가져오기
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000");
const FALLBACK_IMAGE_URL = process.env.NEXT_PUBLIC_FALLBACK_IMAGE_URL;
const IMAGE_VALIDATION_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_IMAGE_VALIDATION_TIMEOUT || "3000");

// 이미지 URL 정리 함수 (향후 확장 가능)
export const convertImageUrl = (imageUrl: string): string => {
  // 현재는 URL을 그대로 반환 (ESP32-CAM이 이미 올바른 ngrok URL 제공)
  return imageUrl;
};

// 이미지 URL 유효성 검사 (옵션)
export const validateImageUrl = async (imageUrl: string): Promise<boolean> => {
  try {
    // HEAD 요청 대신 간단한 fetch로 변경
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IMAGE_VALIDATION_TIMEOUT);

    const response = await fetch(imageUrl, {
      method: "HEAD",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    // 검증 실패해도 이미지는 시도해볼 수 있도록 true 반환
    console.warn("이미지 URL 검증 실패 (무시):", imageUrl, error);
    return true; // 검증 실패해도 이미지 로드 시도
  }
};

// 대체 이미지 URL 생성
export const getFallbackImageUrl = (): string => {
  return FALLBACK_IMAGE_URL ?? "";
};

// API 요청 헬퍼 함수
const apiCall = async <T>(endpoint: string, options?: RequestInit): Promise<APIResponse<T>> => {
  try {
    // 타임아웃 컨트롤러 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true", // ngrok 경고 스킵
        "Cache-Control": "no-cache", // 캐시 방지
        ...options?.headers,
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 직접 데이터를 받아서 처리 (wrapper 없이)
    const result: T = await response.json();

    // 성공적으로 데이터를 받았으면 success: true로 반환
    return { success: true, data: result };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// 최신 OCR 결과 가져오기
export const getLatestResult = async (): Promise<APIResponse<OCRResult>> => {
  return apiCall<OCRResult>("/result/latest");
};

// 날짜별 결과 가져오기 (YYYY-MM-DD 형식)
export const getResultsByDate = async (date?: string): Promise<APIResponse<OCRResult[]>> => {
  const targetDate = date || new Date().toISOString().split("T")[0]; // 기본값: 오늘 날짜
  return apiCall<OCRResult[]>(`/result/by-date?date=${targetDate}`);
};

// --- 백엔드 API 함수들 ---

// 등록된 차량 목록 조회
export const getVehicles = async (): Promise<APIResponse<BackendVehicle[]>> => {
  return apiCall<BackendVehicle[]>("/vehicles");
};

// 차량 등록
export const registerVehicle = async (vehicleData: RegisterVehicleRequest): Promise<APIResponse<BackendVehicle>> => {
  return apiCall<BackendVehicle>("/vehicles", {
    method: "POST",
    body: JSON.stringify(vehicleData),
  });
};

// 주차공간 상태 조회
export const getParkingSpacesStatus = async (): Promise<APIResponse<BackendParkingSpace[]>> => {
  return apiCall<BackendParkingSpace[]>("/parking-spaces/status");
};

// --- 층 정보 API 함수들 ---

// 층 정보 저장
export const saveFloorInfo = async (floorData: FloorSaveRequest): Promise<APIResponse<BackendFloorInfo>> => {
  return apiCall<BackendFloorInfo>("/floor/save", {
    method: "POST",
    body: JSON.stringify(floorData),
  });
};

// 최신 층 정보 조회
export const getLatestFloorInfo = async (): Promise<APIResponse<BackendFloorInfo>> => {
  return apiCall<BackendFloorInfo>("/floor/latest");
};

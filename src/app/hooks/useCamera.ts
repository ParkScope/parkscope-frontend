import { useState, useCallback } from 'react';

export interface UseCameraReturn {
  cameraModalUrl: string | null;
  cameraVehiclePlate: string;
  setCameraModalUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setCameraVehiclePlate: React.Dispatch<React.SetStateAction<string>>;
  handleViewCamera: (imageUrl: string, vehiclePlate?: string) => void;
}

export const useCamera = (): UseCameraReturn => {
  const [cameraModalUrl, setCameraModalUrl] = useState<string | null>(null);
  const [cameraVehiclePlate, setCameraVehiclePlate] = useState<string>("");

  const handleViewCamera = useCallback((imageUrl: string, vehiclePlate?: string) => {
    if (vehiclePlate) {
      setCameraVehiclePlate(vehiclePlate);
    }
    setCameraModalUrl(imageUrl);
  }, []);

  return {
    cameraModalUrl,
    cameraVehiclePlate,
    setCameraModalUrl,
    setCameraVehiclePlate,
    handleViewCamera,
  };
};

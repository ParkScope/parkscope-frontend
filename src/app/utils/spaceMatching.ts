// 주차공간 매칭을 위한 유틸리티 함수들

// 주차공간 타입 정의
interface SpaceForMatching {
  spaceNumber: string;
  status: string;
  [key: string]: unknown;
}

/**
 * 주차공간 번호를 정규화합니다.
 * 예: "B05" -> "B5", "b05" -> "B5", "A01" -> "A1", "ao5" -> "A5"
 */
export const normalizeSpaceNumber = (spaceNumber: string): string => {
  return spaceNumber
    .toUpperCase()
    .replace(/O/g, '0')  // O를 0으로 변환 (ao5 -> a05)
    .replace(/^([A-Z])0+(\d+)$/, '$1$2'); // 앞의 0 제거 (a05 -> a5)
};

/**
 * 두 주차공간 번호가 동일한지 확인합니다.
 * 0이 앞에 붙은 경우도 고려합니다.
 */
export const isSpaceNumberMatch = (space1: string, space2: string): boolean => {
  const normalized1 = normalizeSpaceNumber(space1);
  const normalized2 = normalizeSpaceNumber(space2);
  return normalized1 === normalized2;
};

/**
 * 주차공간 배열에서 매칭되는 공간을 찾습니다.
 */
export const findMatchingSpace = <T extends SpaceForMatching>(
  spaces: T[],
  targetSpaceNumber: string,
  statusFilter?: string[]
): T | undefined => {
  return spaces.find(space => {
    const isNumberMatch = isSpaceNumberMatch(space.spaceNumber, targetSpaceNumber);
    const isStatusMatch = !statusFilter || statusFilter.includes(space.status);
    return isNumberMatch && isStatusMatch;
  });
};



# ParkScope Frontend

## 📖 프로젝트 개요

**ParkScope**는 ESP32-CAM을 기반으로 하는 **실시간 AI 스마트 주차 관제 시스템**의 프론트엔드 애플리케이션입니다. 주차장의 현황을 시각적으로 보여주고, 특정 차량의 위치를 검색하며, 주차장 통계를 한눈에 파악할 수 있는 대시보드를 제공합니다.

## ✨ 주요 기능

- **실시간 주차 현황 시각화**: SVG 기반의 동적 지도를 통해 주차 공간의 점유 상태(`주차 가능`, `주차 중`)를 실시간으로 표시합니다.
- **차량 검색**: 차량 번호를 입력하여 해당 차량의 주차 위치를 지도 상에 하이라이트하여 보여줍니다.
- **다중 주차장 및 층별 관리**: 여러 주차장과 각 주차장의 여러 층을 선택하여 모니터링할 수 있습니다.
- **상세 정보 제공**: 검색된 차량 또는 특정 주차 공간 클릭 시 차량 번호, 주차 시간, 관련 CCTV 이미지 등의 상세 정보를 확인할 수 있습니다.
- **길찾기 안내**: 건물 입구에서 검색된 차량의 주차 위치까지의 최적 경로를 지도 위에 시각적으로 안내합니다.
- **통계 대시보드**: 전체 주차면 수, 현재 주차 중인 차량 수, 주차 가능 대수, 이용률 등 주요 통계 정보를 제공합니다.
- **CCTV 연동**: 차량 검색 결과에서 해당 차량을 촬영한 ESP32-CAM의 이미지를 모달창으로 확인할 수 있습니다.
- **실시간 업데이트**: API를 통해 새로운 주차 정보를 주기적으로 가져와 화면을 자동으로 갱신합니다.

## 🛠️ 기술 스택

- **Framework**: Next.js (v15)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI/Icons**: Lucide React
- **Linting/Formatting**: ESLint

## 📂 프로젝트 구조

```
parkscope-frontend/
├── public/              # 정적 에셋 (이미지 등)
├── src/
│   ├── app/
│   │   ├── components/  # 리액트 컴포넌트
│   │   │   ├── ParkingMap.tsx      # 주차장 지도 시각화
│   │   │   ├── SearchBar.tsx       # 차량 검색 바
│   │   │   ├── StatsCard.tsx       # 통계 정보 카드
│   │   │   └── ...
│   │   ├── data/
│   │   │   └── mockData.ts         # 목업(초기) 데이터
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript 타입 정의
│   │   ├── utils/
│   │   │   ├── apiClient.ts        # API 연동 유틸리티
│   │   │   └── pathCalculator.ts   # 길찾기 경로 계산 로직
│   │   ├── globals.css      # 전역 스타일
│   │   ├── layout.tsx       # 공통 레이아웃
│   │   └── page.tsx         # 메인 페이지
│   └── ...
├── next.config.ts       # Next.js 설정
├── package.json         # 프로젝트 의존성 및 스크립트
└── tsconfig.json        # TypeScript 설정
```

## 🚀 시작하기

### 1. 저장소 복제

```bash
git clone https://github.com/your-username/parkscope-frontend.git
cd parkscope-frontend
```

### 2. 의존성 설치

프로젝트에 필요한 패키지들을 설치합니다.

```bash
npm install
```

### 3. 개발 서버 실행

Next.js 개발 서버를 시작합니다. Turbopack을 사용하여 빠른 실행이 가능합니다.

```bash
npm run dev
```

서버가 실행되면 브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 📜 사용 가능한 스크립트

- `npm run dev`: 개발 모드로 애플리케이션을 실행합니다.
- `npm run build`: 프로덕션용으로 애플리케이션을 빌드합니다.
- `npm run start`: 빌드된 프로덕션 서버를 시작합니다.
- `npm run lint`: ESLint를 사용하여 코드 스타일을 검사하고 문제를 찾습니다.
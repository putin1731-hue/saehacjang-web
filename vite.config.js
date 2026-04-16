import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 1. 운영 환경에서 'eval' 에러를 방지하기 위해 소스맵 생성을 끕니다.
    sourcemap: false,
    // 2. 빌드된 파일들이 너무 커서 발생하는 경고를 방지하기 위해 크기 제한을 늘립니다.
    chunkSizeWarningLimit: 1600,
    // 3. 브라우저 호환성을 위한 최적화 설정
    target: 'esnext'
  }
})
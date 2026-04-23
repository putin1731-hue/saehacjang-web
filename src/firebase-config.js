// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 1. Firebase 콘솔(프로젝트 설정)에서 복사한 본인의 설정값을 여기에 붙여넣으세요.
// 아래 값은 예시이므로 반드시 본인의 키값으로 교체해야 합니다.
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// 2. Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// 3. ⭐ 핵심: 'export' 키워드가 있어야 다른 파일에서 import { db } 로 부를 수 있습니다.
export const db = getFirestore(app);
export const auth = getAuth(app);

// (참고) 기본적으로 app 자체도 내보낼 수 있습니다.
export default app;
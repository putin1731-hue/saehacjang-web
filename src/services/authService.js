/**
 * [authService.js]
 * 황의종 목사님(관리자)과 이준혁 성도님(일반) 권한 분리 및 세션 관리
 */

const USER_STORAGE_KEY = 'saehacjang_users'; 
const SESSION_KEY = 'church_user';

// 1. 초기 시스템 데이터 (기준점)
const DEFAULT_USERS = [
  { id: "admin_01", name: "황의종", phone: "010-2553-0691", role: "admin", status: "ACTIVE" },
  { id: "user_01", name: "이준혁", phone: "010-5158-1731", role: "user", status: "ACTIVE" },
  { id: "user_02", name: "박은혜", phone: "010-3333-4444", role: "user", status: "ACTIVE" },
  { id: "user_03", name: "이진리", phone: "010-5555-6666", role: "user", status: "PENDING" },
  { id: "user_04", name: "최믿음", phone: "010-7777-8888", role: "user", status: "ACTIVE" },
  { id: "user_05", name: "정평화", phone: "010-9999-0000", role: "user", status: "ACTIVE" }
];

export const authService = {
  // 초기 데이터 세팅 (DB가 비어있을 때만 실행)
  initData: () => {
    if (!localStorage.getItem(USER_STORAGE_KEY)) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    }
  },

  // 1. [핵심] 로그인 처리 (권한별 맞춤 입장)
  login: async (name, phone) => {
    authService.initData();
    const cleanPhone = phone.replace(/-/g, "");
    
    // A. [관리자 검문] 황의종 목사님인 경우
    if (name === "황의종" && (cleanPhone === "01025530691" || cleanPhone === "25530691")) {
      const adminUser = DEFAULT_USERS.find(u => u.id === "admin_01");
      localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
      return { success: true, user: adminUser };
    }

    // B. [성도 검문] 이준혁 기획관님 포함 일반 성도인 경우
    const data = localStorage.getItem(USER_STORAGE_KEY);
    const users = data ? JSON.parse(data) : [];
    const foundUser = users.find(u => 
      u.name === name && u.phone.replace(/-/g, "") === cleanPhone
    );

    if (foundUser) {
      const access = authService.canAccess(foundUser);
      if (access.allowed) {
        // DB에 저장된 실제 권한(role)을 부여 (이준혁 성도는 'user' 권한으로 입장)
        localStorage.setItem(SESSION_KEY, JSON.stringify(foundUser));
        return { success: true, user: foundUser };
      }
      return { success: false, message: access.message };
    }

    return { success: false, message: "가입 정보가 없거나 승인되지 않았습니다." };
  },

  // 2. 로그아웃
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = '/';
  },

  // 3. 세션 복구 (새로고침 대응)
  getCurrentUser: () => {
    const user = localStorage.getItem(SESSION_KEY);
    return user ? JSON.parse(user) : null;
  },

  // 4. 회원가입 신청
  register: async (userData) => {
    authService.initData();
    const data = localStorage.getItem(USER_STORAGE_KEY);
    const users = JSON.parse(data);
    
    if (users.find(u => u.phone === userData.phone)) {
      return { success: false, message: "이미 가입 신청된 번호입니다." };
    }

    const newEntry = {
      ...userData,
      id: Date.now(),
      role: "user",
      status: "PENDING", 
      requestDate: new Date().toISOString()
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify([...users, newEntry]));
    return { success: true };
  },

  // 5. 접속 권한 판별
  canAccess: (user) => {
    if (!user) return { allowed: false, message: "회원 정보가 없습니다." };
    if (user.status === "PENDING") return { allowed: false, message: "목사님의 승인을 기다리는 중입니다." };
    if (user.status === "REJECTED") return { allowed: false, message: "가입 신청이 반려되었습니다." };
    return { allowed: user.status === "ACTIVE", message: "환영합니다!" };
  },

  // 6. [행정] 승인/반려 처리
  updateUserStatus: async (userId, decision) => {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    if (data) {
      let users = JSON.parse(data);
      users = users.map(u => u.id === userId ? { ...u, status: decision } : u);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
      return { success: true };
    }
    return { success: false };
  }
};
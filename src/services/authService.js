/**
 * [authService.js]
 * 회원가입, 로그인(마스터 키 포함), 목사님 승인 프로세스 관리
 */

const USER_STORAGE_KEY = 'saehacjang_users';

// 예시 회원 5명 + 기획관님(관리자) 기본 데이터
const DEFAULT_USERS = [
  { id: "admin_01", name: "황의종", phone: "010-2553-0691", role: "admin", status: "ACTIVE" },
  { id: "user_01", name: "이준혁", phone: "010-5158-1731", role: "user", status: "ACTIVE" },
  { id: "user_02", name: "박은혜", phone: "010-3333-4444", role: "user", status: "ACTIVE" },
  { id: "user_03", name: "이진리", phone: "010-5555-6666", role: "user", status: "PENDING" },
  { id: "user_04", name: "최믿음", phone: "010-7777-8888", role: "user", status: "ACTIVE" },
  { id: "user_05", name: "정평화", phone: "010-9999-0000", role: "user", status: "ACTIVE" }
];

export const authService = {
  // 초기 데이터 세팅 (금고가 비어있으면 예시 회원들로 채움)
  initData: () => {
    if (!localStorage.getItem(USER_STORAGE_KEY)) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    }
  },

  // 1. 로그인 (기획관님 하이패스 포함)
  login: async (name, phone) => {
    authService.initData(); // 데이터 없으면 초기화
    const cleanPhone = phone.replace(/-/g, ""); // 하이픈 제거
    
    // [슈퍼 패스] 기획관님은 무조건 통과
    if (name === "이준혁" && (cleanPhone === "51581731" || cleanPhone === "01051581731")) {
      const admin = DEFAULT_USERS[0];
      localStorage.setItem('church_user', JSON.stringify(admin));
      return { success: true, user: admin };
    }

    // 일반 유저 확인
    const data = localStorage.getItem(USER_STORAGE_KEY);
    const users = data ? JSON.parse(data) : [];
    const foundUser = users.find(u => u.name === name && u.phone.replace(/-/g, "") === cleanPhone);

    if (foundUser) {
      const access = authService.canAccess(foundUser);
      if (access.allowed) {
        localStorage.setItem('church_user', JSON.stringify(foundUser));
        return { success: true, user: foundUser };
      }
      return { success: false, message: access.message };
    }

    return { success: false, message: "가입 정보가 없거나 승인되지 않았습니다." };
  },

  // 2. 로그아웃
  logout: () => {
    localStorage.removeItem('church_user');
    window.location.href = '/';
  },

  // 3. 현재 로그인된 유저 가져오기
  getCurrentUser: () => {
    const user = localStorage.getItem('church_user');
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

  // 6. [목사님 전용] 승인/반려 처리
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
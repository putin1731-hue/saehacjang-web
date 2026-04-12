/**
 * [authService.js]
 * 회원가입 신청 및 목사님 승인 프로세스 관리
 * 저장소: localStorage (saehacjang_users)
 */

const USER_STORAGE_KEY = 'saehacjang_users';

export const authService = {
  // 1. [보강] 가입된 유저인지 전화번호로 확인 (검문소)
  getUserByPhone: async (phone) => {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    const users = data ? JSON.parse(data) : [];
    return users.find(u => u.phone === phone) || null;
  },

  // 2. [보강] 회원가입 신청 (저장 기능 추가)
  register: async (userData) => {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      const users = data ? JSON.parse(data) : [];
      
      // 이미 가입된 번호인지 확인
      if (users.find(u => u.phone === userData.phone)) {
        return { success: false, message: "이미 가입 신청된 번호입니다." };
      }

      // 데이터 규격 생성 (기존 registerRequest 로직 통합)
      const newEntry = {
        ...userData,
        role: userData.role || "user",
        status: userData.status || "PENDING", 
        requestDate: new Date().toISOString(),
        activeTeams: 0
      };

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify([...users, newEntry]));
      return { success: true };
    } catch (e) {
      console.error("가입 처리 에러:", e);
      return { success: false, message: "시스템 오류가 발생했습니다." };
    }
  },

  // 3. 로그인 가능 여부 판별 (기존 유지)
  canAccess: (user) => {
    if (!user) return { allowed: false, message: "회원 정보가 없습니다." };
    if (user.status === "PENDING") return { allowed: false, message: "목사님의 승인을 기다리는 중입니다." };
    if (user.status === "REJECTED") return { allowed: false, message: "가입 신청이 반려되었습니다." };
    return { allowed: user.status === "ACTIVE", message: "환영합니다!" };
  },

  // 4. [목사님 전용] 승인/반려 처리 (로컬+서버 하이브리드)
  updateUserStatus: async (userId, decision) => {
    try {
      // 로컬 데이터 먼저 업데이트 (즉시 반영을 위해)
      const data = localStorage.getItem(USER_STORAGE_KEY);
      if (data) {
        let users = JSON.parse(data);
        users = users.map(u => u.id === userId ? { ...u, status: decision } : u);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
      }

      // 서버 API와 통신 시도 (실제 서버가 있을 경우)
      const response = await fetch(`/api/admin/approve-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: decision })
      }).catch(() => ({ ok: false })); // 서버 없어도 죽지 않게 처리

      return { success: true };
    } catch (error) {
      console.error("행정 처리 중 오류 발생:", error);
      return { success: false };
    }
  }
};
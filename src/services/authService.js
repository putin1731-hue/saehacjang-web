/**
 * [수정된 authService.js]
 * 로컬 저장소를 버리고 서버(server.js)와 직접 통신합니다.
 */

const SESSION_KEY = 'church_user';

export const authService = {
  // 1. 로그인 (서버에 물어봅니다)
  login: async (name, phone) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // 서버가 승인하면 세션 저장
        localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
        return { success: true, user: result.user };
      }
      return { success: false, message: result.message || "로그인 실패" };
    } catch (error) {
      return { success: false, message: "서버 연결 오류" };
    }
  },

  // 2. 회원가입 (서버 우체국으로 편지를 보냅니다)
  register: async (userData) => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const result = await response.json();
      return { success: response.ok && result.success, message: result.message };
    } catch (error) {
      return { success: false, message: "서버 연결 오류" };
    }
  },

  // 3. 로그아웃
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = '/';
  },

  // 4. 현재 로그인된 유저 확인
  getCurrentUser: () => {
    const user = localStorage.getItem(SESSION_KEY);
    return user ? JSON.parse(user) : null;
  }
};
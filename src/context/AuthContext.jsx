// context/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // [핵심 수정] useState의 초기값으로 localStorage를 바로 조회합니다.
  // 이렇게 하면 새로고침 버튼을 누르는 0.001초 사이에도 유저 정보를 잃지 않습니다.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("relay_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    // 로그인 시 저장소에 기록
    localStorage.setItem("relay_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // 인위적인 로그아웃 버튼 클릭 시에만 삭제
    localStorage.removeItem("relay_user");
    localStorage.removeItem("current_page");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
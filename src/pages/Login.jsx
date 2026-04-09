import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login({ onNavigate }) {
  const [name, setName] = useState(""); // 1. email 대신 name으로 변경
  const [phone, setPhone] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  // 1. 인증번호 전송 함수
  const sendAuthCode = () => {
    // 성함과 연락처 유효성 검사 (이메일 체크 로직 제거)
    if (name.length < 2 || phone.length < 10) {
      setError("성함과 연락처를 정확히 입력해 주세요.");
      return;
    }
    setError("");
    alert(`${phone} 번호로 인증번호가 발송되었습니다. (테스트 번호: 1234)`);
    setIsSent(true);
  };

  // 2. 최종 로그인 제출 함수
  const handleLogin = (e) => {
    if (e) e.preventDefault();

    if (!isSent) {
      setError("먼저 인증번호를 전송해 주세요.");
      return;
    }

    if (authCode !== "1234") {
      setError("인증번호가 일치하지 않습니다.");
      return;
    }

    // ── [중요] 관리자 판별 로직 ──
    // 이름이 '이준혁'이고 번호가 맞으면 'admin' 권한 부여
    const isAdmin = name === "이준혁" && phone === "01012345678";

    const userData = {
      name,
      phone,
      id: phone,
      role: isAdmin ? "admin" : "user", // 'admin' 권한 부여!
      status: "ACTIVE" // 관리자는 즉시 활성화
    };

    login(userData); 
    onNavigate("dashboard"); 
  };

  return (
    <div className="min-h-screen bg-[#fdf8f2] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-[#f5e6d3]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#3a2e24] mb-2">성도 실명 로그인</h1>
          <p className="text-[#8b5e3c] text-sm">본인 인증 후 필사 여정을 이어가세요.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* 성함 입력 (이메일 대신) */}
          <input
            type="text"
            disabled={isSent}
            className="w-full p-4 rounded-2xl border-2 border-[#e9dcc9] focus:border-[#c8923a] outline-none transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="성함 (예: 이준혁)"
          />

          {/* 연락처 입력 */}
          <div className="flex gap-2">
            <input
              type="tel"
              disabled={isSent}
              className="flex-1 p-4 rounded-2xl border-2 border-[#e9dcc9] focus:border-[#c8923a] outline-none transition-all"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="연락처 (01012345678)"
            />
            {!isSent && (
              <button 
                type="button"
                onClick={sendAuthCode}
                className="px-4 bg-[#8b5e3c] text-white rounded-2xl text-xs font-bold whitespace-nowrap"
              >
                번호인증
              </button>
            )}
          </div>

          {/* 인증번호 입력 */}
          {isSent && (
            <input
              type="text"
              className="w-full p-4 rounded-2xl border-2 border-[#c8923a] bg-[#fdf8f2] outline-none animate-fade-in"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="인증번호 4자리 입력 (1234)"
            />
          )}

          {error && <p className="text-red-500 text-xs ml-2">⚠️ {error}</p>}

          <button
            type="submit"
            className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all transform active:scale-95 ${
              isSent ? "bg-[#c8923a] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
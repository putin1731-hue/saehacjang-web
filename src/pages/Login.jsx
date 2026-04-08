import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // 휴대폰 번호 추가
  const [authCode, setAuthCode] = useState(""); // 인증번호 추가
  const [isSent, setIsSent] = useState(false); // 인증번호 전송 여부
  const [error, setError] = useState("");
  const { login } = useAuth();

  // 1. 인증번호 전송 함수
  const sendAuthCode = () => {
    if (!email.includes("@") || phone.length < 10) {
      setError("이메일과 연락처를 정확히 입력해 주세요.");
      return;
    }
    setError("");
    // 실제로는 여기서 Firebase의 전화번호 인증(Recaptcha 등) 로직이 돌아갑니다.
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

    // 인증번호 확인 (테스트용: 1234)
    if (authCode !== "1234") {
      setError("인증번호가 일치하지 않습니다.");
      return;
    }

    // ── 성공 시 사용자 데이터 구성 ──
    // 이메일과 전화번호를 결합하여 고유 사용자로 인식하게 합니다.
    const userData = {
      email,
      phone,
      id: phone, // 전화번호를 고유 ID로 사용하면 중복 방지에 좋습니다.
      role: email === "admin@test.com" ? "admin" : "member",
      approved: true
    };

    login(userData); // 이제 AuthContext에 이 정보가 담깁니다.
    onNavigate("dashboard"); // 필사 대시보드로 이동
  };

  return (
    <div className="min-h-screen bg-[#fdf8f2] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-[#f5e6d3]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#3a2e24] mb-2">성도 개별 로그인</h1>
          <p className="text-[#8b5e3c] text-sm">본인 인증 후 필사 여정을 이어가세요.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* 이메일 입력 */}
          <input
            type="email"
            disabled={isSent}
            className="w-full p-4 rounded-2xl border-2 border-[#e9dcc9] focus:border-[#c8923a] outline-none transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 (example@test.com)"
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
                className="px-4 bg-[#8b5e3c] text-white rounded-2xl text-xs font-bold"
              >
                번호인증
              </button>
            )}
          </div>

          {/* 인증번호 입력 (전송 후에만 표시) */}
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
            로그인하여 필사 이어하기
          </button>
        </form>
      </div>
    </div>
  );
}
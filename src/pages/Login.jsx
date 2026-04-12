import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService"; // 가입 정보 확인을 위한 서비스

export default function Login({ onNavigate }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  // 1. 인증번호 전송 및 가입 여부 확인
  const sendAuthCode = async () => {
    if (name.length < 2 || phone.length < 10) {
      setError("성함과 연락처를 정확히 입력해 주세요.");
      return;
    }

    // [추가] 가입된 유저인지 먼저 확인
    const userCheck = await authService.getUserByPhone(phone);
    
    // 관리자(이준혁)는 예외적으로 가입 여부 상관없이 통과 (혹은 미리 가입되어 있어야 함)
    const isAdmin = name === "이준혁" && phone === "01012345678";

    if (!userCheck && !isAdmin) {
      setError("등록되지 않은 정보입니다. 회원가입을 먼저 진행해 주세요.");
      return;
    }

    // [추가] 승인 상태 확인 (PENDING이면 로그인 차단)
    if (userCheck && userCheck.status === "PENDING" && !isAdmin) {
      setError("아직 승인 대기 중입니다. 목사님 승인 후 로그인이 가능합니다.");
      return;
    }

    setError("");
    alert(`${phone} 번호로 인증번호가 발송되었습니다. (테스트 번호: 1234)`);
    setIsSent(true);
  };

  // 2. 최종 로그인 제출 함수
  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    if (!isSent) {
      setError("먼저 인증번호를 전송해 주세요.");
      return;
    }

    if (authCode !== "1234") {
      setError("인증번호가 일치하지 않습니다.");
      return;
    }

    // ── [중요] 로그인 유저 데이터 확정 ──
    const isAdmin = name === "이준혁" && phone === "01012345678";
    
    // DB에서 최신 유저 정보를 가져옴
    const dbUser = await authService.getUserByPhone(phone);

    const userData = {
      name: dbUser?.name || name,
      phone: dbUser?.phone || phone,
      id: phone,
      role: isAdmin ? "admin" : (dbUser?.role || "user"),
      status: isAdmin ? "ACTIVE" : (dbUser?.status || "ACTIVE")
    };

    login(userData); 
    onNavigate("dashboard"); 
  };

  return (
    <div className="min-h-screen bg-[#fdf8f2] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-[#f5e6d3]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#3a2e24] mb-2 font-serif">성도 실명 로그인</h1>
          <p className="text-[#8b5e3c] text-sm">본인 인증 후 사역에 참여하세요.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            disabled={isSent}
            className="w-full p-4 rounded-2xl border-2 border-[#e9dcc9] focus:border-[#c8923a] outline-none transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="성함 (실명)"
          />

          <div className="flex gap-2">
            <input
              type="tel"
              disabled={isSent}
              className="flex-1 p-4 rounded-2xl border-2 border-[#e9dcc9] focus:border-[#c8923a] outline-none transition-all"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="연락처 (-없이 입력)"
            />
            {!isSent && (
              <button 
                type="button"
                onClick={sendAuthCode}
                className="px-4 bg-[#8b5e3c] text-white rounded-2xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all"
              >
                번호인증
              </button>
            )}
          </div>

          {isSent && (
            <input
              type="text"
              className="w-full p-4 rounded-2xl border-2 border-[#c8923a] bg-[#fdf8f2] outline-none animate-in fade-in slide-in-from-top-2 duration-300"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="인증번호 4자리 (1234)"
            />
          )}

          {error && <p className="text-red-500 text-[0.7rem] ml-2 font-bold animate-bounce">⚠️ {error}</p>}

          <button
            type="submit"
            className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all transform active:scale-95 ${
              isSent ? "bg-[#c8923a] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            style={isSent ? { background: "linear-gradient(135deg, #8b5e3c, #c8923a)" } : {}}
          >
            로그인
          </button>
          
          {/* 가입 유도 버튼 */}
          <p className="text-center text-xs text-gray-400 mt-4">
            아직 등록되지 않으셨나요? 
            <button type="button" onClick={() => onNavigate("signup")} className="ml-2 text-[#c8923a] font-bold underline">회원가입 신청</button>
          </p>
        </form>
      </div>
    </div>
  );
}
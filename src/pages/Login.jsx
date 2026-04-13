import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";

export default function Login({ onNavigate }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  // 1. [수정] 인증번호 전송 및 마스터 키 확인
  const sendAuthCode = async () => {
    if (name.length < 2 || phone.length < 10) {
      setError("성함과 연락처를 정확히 입력해 주세요.");
      return;
    }

    const cleanPhone = phone.replace(/-/g, "");
    
    // ⭐ [핵심] 기획관님 전용 마스터 키 체크 (01051581731)
    const isMaster = name === "이준혁" && (cleanPhone === "01051581731" || cleanPhone === "51581731");

    if (isMaster) {
      setError("");
      alert("기획관님, 마스터 키가 활성화되었습니다. (테스트 번호: 1234)");
      setIsSent(true);
      return;
    }

    // 일반 유저 검문 (기존 로직 유지)
    const userCheck = await authService.getUserByPhone(phone);
    if (!userCheck) {
      setError("등록되지 않은 정보입니다. 회원가입을 먼저 진행해 주세요.");
      return;
    }

    if (userCheck.status === "PENDING") {
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

    // ⭐ [핵심] authService.login을 호출하여 마스터 데이터 세팅
    const result = await authService.login(name, phone);

    if (result.success) {
      login(result.user); // Context 상태 업데이트
      
      // 관리자면 사역 관제 센터로, 아니면 대시보드로 이동
      if (result.user.role === "admin") {
        onNavigate("pastor-office");
      } else {
        onNavigate("dashboard");
      }
    } else {
      setError(result.message);
    }
  };

  // --- 아래 디자인(return 부분)은 1%도 수정하지 않고 그대로 유지합니다 ---
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
          
          <p className="text-center text-xs text-gray-400 mt-4">
            아직 등록되지 않으셨나요? 
            <button type="button" onClick={() => onNavigate("signup")} className="ml-2 text-[#c8923a] font-bold underline">회원가입 신청</button>
          </p>
        </form>
      </div>
    </div>
  );
}
import { useState } from "react";
import { authService } from "../services/authService"; // 가입 서비스 임포트

export default function Signup({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // 1. 필수 입력 체크
    if (!formData.name || !formData.phone || !formData.password) {
      alert("모든 항목을 입력해 주세요.");
      return;
    }

    // 2. 가입 서비스 호출 (서버/로컬 저장소에 신청 데이터 전송)
    const result = await authService.register({
      ...formData,
      role: "user",
      status: "PENDING", // 가입 즉시 '대기' 상태로 설정
      createdAt: new Date().toISOString()
    });

    if (result.success) {
      alert("가입 신청이 완료되었습니다. 목사님 승인 후 이용 가능합니다.");
      onNavigate("pending"); // '승인 대기 안내' 페이지로 이동
    } else {
      alert(result.message || "가입 신청 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f2] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-xl border border-[#c8923a]/10">
        <div className="text-center mb-8">
          <span className="text-[#c8923a] text-xs tracking-widest uppercase font-bold">Welcome</span>
          <h1 className="text-2xl font-bold text-[#3a2e24] mt-2 font-serif">새학장교회 교적 등록</h1>
          <p className="text-gray-500 text-sm mt-2">하나님 나라의 가족이 되신 것을 환영합니다.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3a2e24] mb-2 px-1">성함</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#c8923a] focus:ring-1 focus:ring-[#c8923a] outline-none transition-all text-sm"
              placeholder="실명을 입력해 주세요"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a2e24] mb-2 px-1">연락처</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#c8923a] focus:ring-1 focus:ring-[#c8923a] outline-none transition-all text-sm"
              placeholder="010-0000-0000"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a2e24] mb-2 px-1">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#c8923a] focus:ring-1 focus:ring-[#c8923a] outline-none transition-all text-sm"
              placeholder="비밀번호를 설정해 주세요"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#8b5e3c] text-white rounded-xl font-bold shadow-lg hover:shadow-2xl active:scale-95 transition-all mt-6"
            style={{ background: "linear-gradient(135deg, #8b5e3c, #c8923a)" }}
          >
            가입 신청하기
          </button>
        </form>
      </div>
    </div>
  );
}
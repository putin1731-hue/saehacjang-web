import { useState } from "react";

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
    
    if (!formData.name || !formData.phone || !formData.password) {
      alert("모든 항목을 입력해 주세요.");
      return;
    }

    try {
      // 🚀 [수정] 중간 서비스 없이 서버 주소(/api/signup - 소문자)로 직접 발송!
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: "user",
          status: "ACTIVE", // 👈 [변경] 가입 즉시 바로 정회원!
          createdAt: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("환영합니다! 가입이 완료되어 즉시 이용 가능합니다.");
        // 가입 성공 후 바로 로그인 페이지나 홈으로 이동
        onNavigate("login"); 
      } else {
        alert(result.message || "이미 등록된 번호이거나 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("가입 통신 에러:", error);
      alert("서버와 통신이 원활하지 않습니다.");
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
          {/* 성함 입력 */}
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

          {/* 연락처 입력 */}
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

          {/* 비밀번호 입력 */}
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
            가입 및 시작하기
          </button>
        </form>
      </div>
    </div>
  );
}
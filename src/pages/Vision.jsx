import React from "react";

export default function Vision() {
  const coreValues = [
    {
      title: "말씀 중심 (Word)",
      description: "변하지 않는 진리의 말씀을 삶의 기준으로 삼고, 날마다 말씀을 깊이 묵상하며 성숙해가는 공동체입니다.",
      icon: "📖",
      color: "#8b5e3c"
    },
    {
      title: "사랑의 교제 (Love)",
      description: "예수 그리스도의 사랑으로 서로를 돌보며, 소외된 이웃 없이 모두가 하나 되어 가족처럼 지내는 공동체입니다.",
      icon: "❤️",
      color: "#c8923a"
    },
    {
      title: "세상의 빛 (Mission)",
      description: "받은 사랑을 세상에 전하며, 복음의 빛으로 지역 사회를 밝히고 열방을 향해 나아가는 선교적 공동체입니다.",
      icon: "✨",
      color: "#5d4037"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f2] py-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* 상단 헤더 섹션 */}
        <div className="text-center mb-20">
          <span className="text-[#c8923a] font-medium tracking-[0.2em] text-sm uppercase">Our Vision</span>
          <h1 className="text-4xl font-bold text-[#3a2e24] mt-3 mb-6">교회 비전 및 핵심가치</h1>
          <div className="w-16 h-1 bg-[#c8923a] mx-auto mb-8"></div>
          <p className="text-xl md:text-2xl font-serif italic text-[#8b5e3c]">
            "하나님을 기쁘시게, 세상을 행복하게 하는 공동체"
          </p>
        </div>

        {/* 메인 비전 카드 섹션 */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {coreValues.map((value, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-3xl shadow-sm border border-[#f5e6d3] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group"
            >
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-[#3a2e24] mb-4">
                {value.title}
              </h3>
              <p className="text-[#5d4037] leading-relaxed text-sm">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* 슬로건/미션 섹션 (배너 스타일) */}
        <div className="bg-[#8b5e3c] rounded-[2rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          {/* 배경 장식 요소 */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4"></div>

          <h2 className="text-2xl md:text-3xl font-bold mb-6 relative z-10">2026년 우리 교회의 다짐</h2>
          <p className="text-lg md:text-xl text-[#fdf8f2]/90 leading-loose relative z-10 font-light">
            우리는 <strong>예배</strong>를 통해 하나님을 만나고,<br className="hidden md:block" />
            <strong>훈련</strong>을 통해 제자가 되며,<br className="hidden md:block" />
            <strong>섬김</strong>을 통해 세상을 변화시키는 전진하는 교회가 되겠습니다.
          </p>
        </div>

      </div>
    </div>
  );
}
import React from "react";

export default function ChurchHistory() {
  const historyData = [
    {
      year: "2015",
      title: "교회 설립 및 첫 예배",
      description: "하나님의 인도하심 속에 지역 사회를 향한 첫 걸음을 내딛었습니다.",
      icon: "⛪",
    },
    {
      year: "2018",
      title: "지역 사회 봉사단 발족",
      description: "이웃 사랑을 실천하기 위한 나눔과 섬김의 사역을 시작했습니다.",
      icon: "🤝",
    },
    {
      year: "2020",
      title: "온라인 예배 시스템 구축",
      description: "어떤 상황에서도 예배의 끈을 놓지 않기 위해 비대면 사역을 확장했습니다.",
      icon: "💻",
    },
    {
      year: "2024",
      title: "비전 2030 선포",
      description: "다음 세대를 세우고 열방을 향해 나아가는 새로운 비전을 품었습니다.",
      icon: "✨",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f2] py-20 px-6">
      {/* 헤더 섹션 */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-3xl font-bold text-[#3a2e24] mb-4">교회 역사</h1>
        <div className="w-12 h-1 bg-[#c8923a] mx-auto mb-6"></div>
        <p className="text-[#8b5e3c] leading-relaxed">
          새학장교회가 걸어온 모든 순간에는 하나님의 은혜가 있었습니다.<br />
          우리의 발걸음은 멈추지 않고 내일을 향해 나아갑니다.
        </p>
      </div>

      {/* 타임라인 섹션 */}
      <div className="max-w-4xl mx-auto relative">
        
        {/* 중앙 수직선 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-[#e9dcc9]"></div>

        <div className="space-y-12">
          {historyData.map((item, index) => (
            <div key={item.year} className={`flex items-center w-full ${index % 2 === 0 ? "flex-row-reverse" : ""}`}>
              
              {/* 콘텐츠 박스 */}
              <div className="w-1/2 px-8">
                <div 
                  className={`p-6 bg-white rounded-2xl shadow-sm border border-[#f5e6d3] transition-transform hover:-translate-y-1 duration-300 ${
                    index % 2 === 0 ? "text-left" : "text-right"
                  }`}
                >
                  <span className="inline-block px-3 py-1 bg-[#fdf8f2] text-[#c8923a] text-sm font-bold rounded-full mb-3">
                    {item.year}
                  </span>
                  <h3 className="text-xl font-bold text-[#3a2e24] mb-2">{item.title}</h3>
                  <p className="text-[#8b5e3c] text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* 중앙 포인트 (아이콘) */}
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 bg-white border-2 border-[#c8923a] rounded-full z-10 shadow-sm text-lg">
                {item.icon}
              </div>

              {/* 반대편 빈 공간 */}
              <div className="w-1/2"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 푸터 느낌의 메시지 */}
      <div className="max-w-3xl mx-auto text-center mt-20 pt-10 border-t border-[#e9dcc9]">
        <p className="text-[#c8923a] font-serif italic text-lg">
          "에벤에셀, 여기까지 우리를 도우셨다"
        </p>
      </div>
    </div>
  );
}
import React from "react";

export default function PastorGreeting() {
  return (
    <div className="min-h-screen bg-[#fdf8f2] py-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* 상단 타이틀 섹션 */}
        <div className="text-center mb-16">
          <span className="text-[#c8923a] font-medium tracking-widest uppercase text-sm">Welcome Message</span>
          <h1 className="text-3xl font-bold text-[#3a2e24] mt-2 mb-4">담임목사 인사말</h1>
          <div className="w-12 h-1 bg-[#c8923a] mx-auto"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 lg:gap-20">
          
          {/* 왼쪽: 목사님 프로필 이미지 섹션 */}
          <div className="w-full md:w-2/5">
            <div className="relative">
              {/* 이미지 프레임 장식 */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-[#c8923a]/30"></div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-[#c8923a]/30"></div>
              
              <div className="aspect-[3/4] bg-[#e9dcc9] rounded-2xl overflow-hidden shadow-xl border-8 border-white">
                {/* 실제 목사님 사진 경로를 src에 넣으시면 됩니다 */}
                <img 
                  src="/api/placeholder/400/533" 
                  alt="담임목사님" 
                  className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                />
              </div>
              
              <div className="mt-6 text-center">
                <h2 className="text-xl font-bold text-[#3a2e24]">담임목사 <span className="text-2xl ml-1">황의종</span></h2>
                <p className="text-[#c8923a] text-sm mt-1">SaeHakjang Church Senior Pastor</p>
              </div>
            </div>
          </div>

          {/* 오른쪽: 인사말 본문 섹션 */}
          <div className="w-full md:w-3/5 flex flex-col justify-center">
            {/* 핵심 메시지 (인용구 스타일) */}
            <div className="relative mb-8">
              <span className="absolute -top-6 -left-2 text-6xl text-[#c8923a]/20 font-serif">“</span>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#3a2e24] leading-snug pt-2">
                하나님의 사랑이 당신의 <br />
                삶 속에 가득하기를 소망합니다.
              </h3>
            </div>

            {/* 본문 내용 */}
            <div className="space-y-6 text-[#5d4037] leading-[1.8] text-[1.05rem]">
              <p>
                사랑하는 성도 여러분, 그리고 새학장교회 홈페이지를 찾아주신 
                모든 분들을 주님의 이름으로 진심으로 환영하고 축복합니다.
              </p>
              <p>
                우리 교회는 하나님의 말씀 위에 굳건히 서서, 
                상처 입은 영혼들이 쉼을 얻고 다시 일어설 수 있는 
                영적인 안식처가 되고자 노력하고 있습니다.
              </p>
              <p>
                혼자 걷는 길은 외롭지만, 함께 걷는 길은 축복입니다. 
                이곳에서 따뜻한 교제를 통해 하나님의 살아계심을 경험하고, 
                여러분의 삶 속에 예비된 놀라운 계획들을 발견하시길 기도합니다.
              </p>
              <p className="font-medium text-[#3a2e24]">
                당신은 혼자가 아닙니다. 우리가 함께 기도하겠습니다.
              </p>
            </div>

            {/* 하단 서명 섹션 */}
            <div className="mt-12 flex flex-col items-end">
              <div className="text-[#8b5e3c] text-sm mb-2">새학장교회 담임목사</div>
              <div className="font-serif text-3xl text-[#3a2e24] italic select-none">
                황 의 종 <span className="text-sm font-sans not-italic ml-1">목사 올림</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
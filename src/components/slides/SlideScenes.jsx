// SVG 슬라이드 일러스트 5장
// 기존 HTML의 <svg class="slide-bg-svg"> 를 그대로 이식

export function Slide1() {
  return (
    <svg
      className="w-full h-full block"
      style={{ transform: "scale(1.06)", transition: "transform 22s ease" }}
      viewBox="0 0 1440 900"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="s1sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fdf0d5" />
          <stop offset="45%"  stopColor="#f9d98a" />
          <stop offset="75%"  stopColor="#f5c050" />
          <stop offset="100%" stopColor="#e8a830" />
        </linearGradient>
        <radialGradient id="s1sun" cx="60%" cy="45%" r="30%">
          <stop offset="0%"   stopColor="#fff8e0" stopOpacity="0.9" />
          <stop offset="60%"  stopColor="#f9d06a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f9d06a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#s1sky)" />
      <rect width="1440" height="900" fill="url(#s1sun)" />
      <line x1="864" y1="0" x2="400" y2="900" stroke="rgba(255,255,255,0.12)" strokeWidth="60" />
      <line x1="864" y1="0" x2="700" y2="900" stroke="rgba(255,255,255,0.08)" strokeWidth="40" />
      <line x1="864" y1="0" x2="1100" y2="900" stroke="rgba(255,255,255,0.07)" strokeWidth="50" />
      <ellipse cx="250" cy="200" rx="160" ry="55" fill="white" opacity="0.55" />
      <ellipse cx="210" cy="185" rx="100" ry="42" fill="white" opacity="0.5" />
      <ellipse cx="1150" cy="160" rx="200" ry="65" fill="white" opacity="0.5" />
      <ellipse cx="1100" cy="145" rx="130" ry="50" fill="white" opacity="0.45" />
      <ellipse cx="350" cy="900" rx="600" ry="300" fill="#c4a040" opacity="0.45" />
      <ellipse cx="1100" cy="900" rx="550" ry="280" fill="#b89030" opacity="0.4" />
      <rect x="636" y="560" width="168" height="200" fill="rgba(100,65,20,0.75)" />
      <polygon points="636,560 720,480 804,560" fill="rgba(80,50,10,0.8)" />
      <rect x="703" y="450" width="18" height="62" fill="rgba(80,50,10,0.85)" />
      <rect x="688" y="470" width="48" height="13" fill="rgba(80,50,10,0.85)" />
      <rect x="658" y="610" width="26" height="38" rx="13" fill="#fff0a0" opacity="0.75" />
      <rect x="756" y="610" width="26" height="38" rx="13" fill="#fff0a0" opacity="0.75" />
    </svg>
  );
}

export function Slide2() {
  return (
    <svg
      className="w-full h-full block"
      style={{ transform: "scale(1.06)", transition: "transform 22s ease" }}
      viewBox="0 0 1440 900"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="s2sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ddf0ff" />
          <stop offset="55%"  stopColor="#b8dff8" />
          <stop offset="100%" stopColor="#8ac8e8" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#s2sky)" />
      <ellipse cx="300" cy="220" rx="190" ry="72" fill="white" opacity="0.85" />
      <ellipse cx="260" cy="200" rx="130" ry="58" fill="white" opacity="0.8" />
      <ellipse cx="370" cy="195" rx="110" ry="52" fill="white" opacity="0.75" />
      <ellipse cx="1000" cy="180" rx="220" ry="78" fill="white" opacity="0.8" />
      <ellipse cx="950" cy="160" rx="145" ry="60" fill="white" opacity="0.75" />
      <ellipse cx="400" cy="900" rx="700" ry="340" fill="#8abf68" />
      <ellipse cx="900" cy="900" rx="750" ry="300" fill="#78b058" />
      <ellipse cx="700" cy="900" rx="500" ry="200" fill="#98cc78" />
      <circle cx="200" cy="730" r="6" fill="#ffd0e0" opacity="0.7" />
      <circle cx="230" cy="750" r="5" fill="#ffeaa0" opacity="0.7" />
      <circle cx="260" cy="735" r="7" fill="#ffd0e0" opacity="0.7" />
      <rect x="646" y="555" width="148" height="195" fill="white" opacity="0.92" />
      <polygon points="646,555 720,478 794,555" fill="#b8d0e0" />
      <rect x="706" y="452" width="16" height="58" fill="#90a8b8" />
      <rect x="692" y="470" width="44" height="11" fill="#90a8b8" />
      <rect x="673" y="600" width="26" height="38" rx="13" fill="#b8dff8" opacity="0.6" />
      <rect x="741" y="600" width="26" height="38" rx="13" fill="#b8dff8" opacity="0.6" />
      <rect x="695" y="650" width="50" height="110" fill="#c8d8e0" opacity="0.7" />
      <ellipse cx="560" cy="650" rx="42" ry="58" fill="#5a9840" />
      <rect x="553" y="695" width="14" height="80" fill="#7a5430" />
      <ellipse cx="880" cy="640" rx="46" ry="62" fill="#68aa48" />
      <rect x="873" y="688" width="14" height="82" fill="#7a5430" />
    </svg>
  );
}

export function Slide3() {
  return (
    <svg
      className="w-full h-full block"
      style={{ transform: "scale(1.06)", transition: "transform 22s ease" }}
      viewBox="0 0 1440 900"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="s3sky" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%"   stopColor="#fce8c8" />
          <stop offset="35%"  stopColor="#f8c070" />
          <stop offset="65%"  stopColor="#f09040" />
          <stop offset="100%" stopColor="#e07030" />
        </linearGradient>
        <radialGradient id="s3glow" cx="25%" cy="55%" r="40%">
          <stop offset="0%"   stopColor="#fff0c0" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff0c0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#s3sky)" />
      <rect width="1440" height="900" fill="url(#s3glow)" />
      <ellipse cx="700" cy="180" rx="250" ry="72" fill="rgba(255,200,100,0.4)" />
      <ellipse cx="200" cy="240" rx="180" ry="58" fill="rgba(255,180,80,0.35)" />
      <rect x="0" y="700" width="1440" height="200" fill="rgba(240,144,64,0.25)" />
      <ellipse cx="360" cy="700" rx="280" ry="25" fill="rgba(255,220,120,0.3)" />
      <rect x="616" y="530" width="208" height="220" fill="rgba(120,70,20,0.55)" />
      <polygon points="616,530 720,440 824,530" fill="rgba(100,55,15,0.6)" />
      <rect x="704" y="415" width="20" height="65" fill="rgba(100,55,15,0.65)" />
      <rect x="686" y="432" width="56" height="14" fill="rgba(100,55,15,0.65)" />
      <rect x="648" y="590" width="30" height="44" rx="15" fill="#fff0a0" opacity="0.8" />
      <rect x="762" y="590" width="30" height="44" rx="15" fill="#fff0a0" opacity="0.8" />
      <rect x="700" y="660" width="40" height="100" fill="rgba(100,55,15,0.5)" />
    </svg>
  );
}

export function Slide4() {
  return (
    <svg
      className="w-full h-full block"
      style={{ transform: "scale(1.06)", transition: "transform 22s ease" }}
      viewBox="0 0 1440 900"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="s4sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fff8f0" />
          <stop offset="40%"  stopColor="#fde8c8" />
          <stop offset="80%"  stopColor="#f8d49a" />
          <stop offset="100%" stopColor="#e8b870" />
        </linearGradient>
        <radialGradient id="s4sun" cx="50%" cy="35%" r="22%">
          <stop offset="0%"   stopColor="#fffce0" stopOpacity="1" />
          <stop offset="50%"  stopColor="#fde8a0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fde8a0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#s4sky)" />
      <rect width="1440" height="900" fill="url(#s4sun)" />
      <ellipse cx="300" cy="900" rx="550" ry="280" fill="#c8d890" opacity="0.7" />
      <ellipse cx="900" cy="900" rx="700" ry="250" fill="#b8cc80" opacity="0.65" />
      <ellipse cx="1300" cy="900" rx="400" ry="230" fill="#c8d890" opacity="0.6" />
      <rect x="150" y="700" width="60" height="80" fill="white" opacity="0.7" />
      <polygon points="150,700 180,670 210,700" fill="#e8b870" opacity="0.7" />
      <rect x="250" y="690" width="70" height="90" fill="white" opacity="0.65" />
      <polygon points="250,690 285,655 320,690" fill="#daa060" opacity="0.7" />
      <rect x="660" y="530" width="120" height="185" fill="white" opacity="0.88" />
      <polygon points="660,530 720,458 780,530" fill="#e8b870" opacity="0.85" />
      <rect x="706" y="432" width="14" height="52" fill="#c89040" />
      <rect x="694" y="448" width="38" height="11" fill="#c89040" />
      <rect x="680" y="576" width="24" height="36" rx="12" fill="#f8e090" opacity="0.75" />
      <rect x="736" y="576" width="24" height="36" rx="12" fill="#f8e090" opacity="0.75" />
      <ellipse cx="580" cy="680" rx="38" ry="52" fill="#90b860" opacity="0.75" />
      <rect x="573" y="718" width="12" height="60" fill="#806040" opacity="0.7" />
      <ellipse cx="870" cy="672" rx="42" ry="56" fill="#98c068" opacity="0.7" />
    </svg>
  );
}

export function Slide5() {
  return (
    <svg
      className="w-full h-full block"
      style={{ transform: "scale(1.06)", transition: "transform 22s ease" }}
      viewBox="0 0 1440 900"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="s5sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fdf5e8" />
          <stop offset="50%"  stopColor="#f8dfa0" />
          <stop offset="100%" stopColor="#e8c068" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#s5sky)" />
      <ellipse cx="200" cy="580" rx="110" ry="150" fill="#d4882a" opacity="0.7" />
      <ellipse cx="170" cy="550" rx="80"  ry="110" fill="#e8a840" opacity="0.65" />
      <rect x="192" y="710" width="18" height="120" fill="#7a4820" opacity="0.8" />
      <ellipse cx="1240" cy="570" rx="120" ry="155" fill="#c87828" opacity="0.65" />
      <ellipse cx="1210" cy="540" rx="85"  ry="115" fill="#e0983a" opacity="0.6" />
      <rect x="1232" y="708" width="18" height="125" fill="#7a4820" opacity="0.75" />
      <ellipse cx="720" cy="900" rx="900" ry="280" fill="#c89838" opacity="0.4" />
      <ellipse cx="400" cy="900" rx="600" ry="240" fill="#d8a840" opacity="0.35" />
      <rect
        x="648" y="542" width="144" height="200"
        fill="rgba(180,130,60,0.2)"
        stroke="rgba(180,130,60,0.4)" strokeWidth="2"
      />
      <polygon points="648,542 720,460 792,542" fill="rgba(160,110,40,0.25)" />
      <rect x="706" y="435" width="16" height="58" fill="rgba(160,110,40,0.5)" />
      <rect x="692" y="452" width="44" height="12" fill="rgba(160,110,40,0.5)" />
      <rect x="672" y="596" width="26" height="38" rx="13" fill="#ffeea0" opacity="0.7" />
      <rect x="742" y="596" width="26" height="38" rx="13" fill="#ffeea0" opacity="0.7" />
      <circle cx="480" cy="300" r="5" fill="#e08030" opacity="0.5" />
      <circle cx="560" cy="250" r="4" fill="#d07020" opacity="0.45" />
      <circle cx="900" cy="280" r="5" fill="#e89030" opacity="0.5" />
      <circle cx="700" cy="200" r="6" fill="#f0a040" opacity="0.45" />
    </svg>
  );
}

export const SLIDES = [
  { Scene: Slide1, caption: "하나님의 빛 가운데 함께" },
  { Scene: Slide2, caption: "사랑으로 세워가는 공동체" },
  { Scene: Slide3, caption: "저녁 노을처럼 따뜻한 교회" },
  { Scene: Slide4, caption: "새벽마다 새로워지는 은혜" },
  { Scene: Slide5, caption: "학장동과 함께 걷는 믿음의 길" },
];
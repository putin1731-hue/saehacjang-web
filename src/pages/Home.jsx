import { useState, useEffect, useRef, useCallback } from "react";
import { worshipSchedule } from "../data/mockData";
import { SLIDES } from "../components/slides/SlideScenes";

export default function Home({ onNavigate }) {
  const [cur, setCur] = useState(0);
  const [visible, setVisible] = useState([]);
  const timerRef = useRef(null);
  const revealRef = useRef([]);

  const goSlide = useCallback((n) => {
    setCur(n);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCur((c) => (c + 1) % SLIDES.length);
    }, 20000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting)
            setVisible((v) => [...v, e.target.dataset.id]);
        }),
      { threshold: 0.1 }
    );

    revealRef.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const revealClass = (id) =>
    `reveal ${visible.includes(id) ? "visible" : ""}`;

  const WorshipCard = ({ item }) => (
    <div className="rounded-[14px] p-[1.6rem_1.4rem] border transition-all hover:-translate-y-1">
      <p className="text-sm text-gray-500">{item.label}</p>
      <p className="text-lg font-bold text-yellow-600">{item.time}</p>
      <p className="text-xs text-gray-500">{item.sub}</p>
    </div>
  );

  return (
    <div className="bg-[#fdf8f2]">

      {/* HERO */}
      <section className="relative h-screen overflow-hidden">
        {SLIDES.map(({ Scene, caption }, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[1800ms]"
            style={{ opacity: cur === i ? 1 : 0 }}
          >
            <div className="w-full h-full">
              <Scene />
            </div>

            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center">
              <h2 className="bg-white/70 px-6 py-2 rounded-full text-lg">
                {caption}
              </h2>
            </div>
          </div>
        ))}

        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl font-bold text-yellow-700">
            새학장 교회
          </h1>
          <p className="mt-2 text-lg text-yellow-600">
            Sae Hakjang Church
          </p>
        </div>

        {/* 하단 dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goSlide(i)}
              className={`w-2 h-2 rounded-full ${
                cur === i ? "bg-yellow-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* ✅ 수정된 부분 */}
        <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden sm:flex flex-col gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goSlide(i)}
              className="w-1 h-6 bg-gray-300"
            />
          ))}
        </div>
      </section>

      {/* 예배 안내 */}
      <section className="bg-[#f9f2e8] py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">예배 안내</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {worshipSchedule.map((item) => (
              <WorshipCard key={item.label} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center">
        <p>© 2025 새학장 교회</p>
      </footer>
    </div>
  );
}
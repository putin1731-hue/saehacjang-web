import { useState, useEffect, useRef } from "react";
import PrayerCard from "../components/PrayerCard";

export default function PrayerBoard({ currentUser }) {
  const user = currentUser || { name: "성도", role: "user" };

  const [prayers, setPrayers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState("전체");
  const [visible, setVisible] = useState([]);
  const [form, setForm] = useState({ content: "", category: "기타", isAnonymous: false });
  const revealRef = useRef([]);

  const categories = ["전체", "건강", "직장/진로", "가정", "신앙", "감사", "기타"];

  // 🚀 [수정] 서버에서 직접 기도 목록을 가져오는 로직으로 변경
  const loadPrayers = async () => {
    try {
      const res = await fetch('/api/prayers');
      const result = await res.json();
      if (result.success) {
        setPrayers(result.data);
      }
    } catch (err) {
      console.error("기도 로드 실패:", err);
    }
  };

  useEffect(() => {
    loadPrayers();
  }, []);

  const filtered = filterCat === "전체" ? prayers : prayers.filter((p) => p.category === filterCat);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisible((v) => [...v, e.target.dataset.id]);
      }),
      { threshold: 0.08 }
    );
    revealRef.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [prayers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;

    try {
      // 🚀 서버로 직접 전송
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: form.content,
          authorName: user.name,
          authorPhone: user.phone || "",
          isAnonymous: form.isAnonymous,
          category: form.category
        })
      });

      const result = await res.json();

      if (result.success) {
        // 🚀 저장 성공 후 서버의 최신 목록을 다시 불러와 화면 갱신
        await loadPrayers(); 
        setForm({ content: "", category: "기타", isAnonymous: false });
        setShowForm(false);
        alert("기도 요청이 소중하게 전달되었습니다.");
      } else {
        alert("데이터 저장 중 문제가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("서버 연결 오류가 발생했습니다.");
    }
  };

  return (
    // ... 기획관님의 아름다운 UI 디자인 코드 (기존과 동일) ...
    <div style={{ background: "var(--cream, #fdf8f2)", minHeight: "100vh" }}>
      {/* (이하 생략 - 기존 UI 코드 유지) */}
    </div>
  );
}
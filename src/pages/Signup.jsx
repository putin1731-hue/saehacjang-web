export default function Signup({ onNavigate }) {
  return (
    <div className="p-10">
      <h1>회원가입</h1>

      <input className="border p-2 block mb-2" placeholder="이메일" />
      <input className="border p-2 block mb-2" placeholder="비밀번호" />

      <button
        className="bg-green-500 text-white px-4 py-2"
        onClick={() => onNavigate("pending")}
      >
        가입하기
      </button>
    </div>
  );
}
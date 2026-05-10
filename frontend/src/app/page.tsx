import SimulationForm from "@/components/SimulationForm";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          한국인 100명에게 물어본 듯한
          <br />
          시장 반응을 30분 만에.
        </h2>
        <p className="text-gray-500">
          제품/서비스 아이디어를 입력하면, AI가 한국인 페르소나의 반응을
          시뮬레이션합니다.
        </p>
      </div>
      <SimulationForm />
    </div>
  );
}

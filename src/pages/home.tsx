import ConnectTerra from "../components/connectTerra";
import Header from "../components/header";
import Leaderboard from "../components/leaderboard";

export default function Home() {
  return (
    <div className="bg-sky-600 text-white min-h-screen">
      <Header />
      <ConnectTerra />
      <Leaderboard />
    </div>
  );
}

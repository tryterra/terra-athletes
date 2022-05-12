import ConnectTerra from "../components/connectTerra";
import Header from "../components/header";
import Leaderboard from "../components/leaderboard";

export default function Home() {
  return (
    <div>
      <Header />
      <Leaderboard />
      <ConnectTerra />
    </div>
  );
}

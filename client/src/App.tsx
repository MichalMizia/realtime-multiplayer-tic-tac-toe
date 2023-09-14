import { Routes, Route } from "react-router-dom";
import Game from "./games/3X3/Game";
import OnlineGame from "./games/3X3/Online/Game";

function App() {
  return (
    <main className="min-h-screen bg-zinc-100 py-8 md:py-10 lg:py-12">
      <div className="container-md flex items-center justify-center">
        <Routes>
          <Route path="/" element={<Game />} />
          <Route path="/:gameId" element={<OnlineGame />} />
        </Routes>
      </div>
    </main>
  );
}

export default App;

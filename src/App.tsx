import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Add from "./pages/add";
import Home from "./pages/home";
import Fail from "./pages/fail";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<Add />} />
          <Route path="/fail" element={<Fail />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

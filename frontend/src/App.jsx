import { Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import Chat from "./pages/chat.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat/:room" element={<Chat />} />
    </Routes>
  );
}

export default App;

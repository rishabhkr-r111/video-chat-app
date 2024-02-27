import { Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import Chat from "./pages/chat.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<Chat />} />
      {/* <Route path="/*" element={<Home />} /> */}
    </Routes>
  );
}

export default App;

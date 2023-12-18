import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/home.css";

function Home() {
  const navigate = useNavigate();
  const [room, setRoom] = useState("");

  function joinRoom() {
    if (room) {
      const userId = window.prompt("Please enter your user id");
      navigate(`/chat/${room}`, {
        state: { username: userId, room: room },
      });
    }
  }

  function createRoom() {
    const userId = window.prompt("Please enter your user id");
    navigate(`/chat/${room}`, {
      state: { username: userId, room: room },
    });
  }

  return (
    <>
      <div className="home-div">
        <h1>Video Chat app</h1>
        <input
          type="text"
          placeholder="Enter room ID"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <div className="join-btn">
          <button onClick={joinRoom}>Join room</button>
          <button onClick={createRoom}>Create room</button>
        </div>
      </div>
    </>
  );
}

export default Home;

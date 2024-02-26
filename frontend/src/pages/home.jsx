import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "../css/home.css";

const url = "http://127.0.0.1:5000";

function Home() {
  const navigate = useNavigate();
  const [room, setRoom] = useState("");

  async function joinRoom() {
    if (room) {
      const userId = window.prompt("Please enter your user id");
      const response = await fetch(`${url}/join-room`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ username: userId, room: room }),
      });
      if (!response.ok) {
        let text = await response.text();
        alert(response.status + " : " + response.statusText + " : " + text);

        return;
      }

      navigate(`/chat/${room}/${userId}`);
    }
  }

  async function createRoom() {
    const userId = window.prompt("Please enter your user id");
    const response = await fetch(`${url}/create-room`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ username: userId, room: room }),
    });
    console.log(response);
    if (!response.ok) {
      let text = await response.text();
      alert(response.status + " : " + response.statusText + " : " + text);
      return;
    }
    navigate(`/chat/${room}/${userId}`);
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

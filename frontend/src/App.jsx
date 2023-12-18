import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io.connect("http://127.0.0.1:5000");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const messageHandler = (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    socket.on("message", messageHandler);

    // Cleanup function
    return () => {
      socket.off("message", messageHandler);
    };
  }, []);

  const joinRoom = () => {
    if (username && room) {
      socket.emit("join", { username, room });
    }
  };

  const leaveRoom = () => {
    if (username && room) {
      socket.emit("leave", { username, room });
    }
  };

  const sendMessage = () => {
    if (message && room) {
      socket.emit("message", { msg: message, room: room });
      setMessage("");
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>
      <button onClick={leaveRoom}>Leave Room</button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;

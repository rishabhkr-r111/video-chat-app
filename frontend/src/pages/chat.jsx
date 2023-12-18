import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import "../App.css";

const socket = io.connect("http://127.0.0.1:5000");

function Chat() {
  const location = useLocation();
  let { username, room } = location.state;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("join", { username, room });
    console.log(username, room);
    const messageHandler = (msg) => {
      console.log(msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    socket.on("message", messageHandler);

    // Cleanup function
    return () => {
      socket.off("message", messageHandler);
    };
  }, []);

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

export default Chat;

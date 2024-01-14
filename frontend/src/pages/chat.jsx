import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "../App.css";
import "../css/chat.css";

const socket = io.connect("http://127.0.0.1:5000");

function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  let room = location.state.room;
  let username = location.state.username;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!location.state || !location.state.username) {
      navigate("/");
      return;
    }

    let { username, room } = location.state;
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
      socket.emit("message", { user: username, msg: message, room: room });
      setMessage("");
    }
  };

  return (
    <div className="chat-room">
      <h1>Video Chat app</h1>
      <div className="chat-room-container">
        <div className="video-chat">
          <div className="video-container"></div>
          <div className="video-container"></div>
          <div className="video-container"></div>
          <div className="video-container"></div>
          <div className="video-container"></div>
        </div>
        <div className="chat">
          <ul className="chat-messages">
            {messages.map((msg, index) => (
              <li key={index}>{msg["user"] + " : " + msg["msg"]}</li>
            ))}
          </ul>
          <input
            type="text"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
          <button onClick={leaveRoom}>Leave Room</button>
        </div>
      </div>
    </div>
  );
}

export default Chat;

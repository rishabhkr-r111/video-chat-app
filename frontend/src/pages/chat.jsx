import { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import peer from "../services/peer";
import { useSocket } from "../context/socketProvider";

function Chat() {
  const socket = useSocket();
  const { roomId } = useParams();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const handleMessage = useCallback(() => {
    socket.emit("user:message", { to: roomId, message });
    console.log(`Message to ${roomId}: ${message}`);
    setMessages((msgs) => [...msgs, message]);
  }, [message, roomId, socket]);

  const handleIncommingMessage = useCallback(({ from, message }) => {
    console.log(`Message from ${from}: ${message}`);
    setMessages((msgs) => [...msgs, message]);
  }, []);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${id} joined room`);
    setRemoteSocketId(id);
    setMessages((msgs) => [...msgs, `${email} joined room`]);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    console.log("user" + stream);
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("incomming:message", handleIncommingMessage);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("incomming:message", handleIncommingMessage);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
    handleIncommingMessage,
  ]);

  return (
    <div>
      <h1>Room Page</h1>
      <div>
        <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
        {myStream && <button onClick={sendStreams}>Send Stream</button>}
        {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
        {myStream && (
          <>
            <h1>My Stream</h1>
            <ReactPlayer
              playing={true}
              muted
              height="100px"
              width="200px"
              url={myStream}
            />
          </>
        )}
        {remoteStream && (
          <>
            <h1>Remote Stream</h1>
            <ReactPlayer
              playing={true}
              muted
              height="100px"
              width="200px"
              url={remoteStream}
            />
          </>
        )}
      </div>
      <div>
        <h1>Chat</h1>
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
        <input
          type="text"
          onChange={(e) => {
            console.log(e.target.value);
            setMessage(e.target.value);
          }}
        />
        <button onClick={handleMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;

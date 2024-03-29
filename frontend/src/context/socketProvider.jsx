import { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);

  return socket;
};

export const SocketProvider = (props) => {
  const socket = useMemo(() => {
    //localhost:5000
    const s = io("https://api-vidchat.onrender.com", { debug: true });
    return s;
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};

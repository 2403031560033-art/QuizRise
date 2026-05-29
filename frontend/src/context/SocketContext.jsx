import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
{/* Only connect if user is authenticated */}if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    console.log(`Connecting to Socket.IO server at: ${socketUrl}`);
    const newSocket = io(socketUrl, {
      transports: ["websocket"],
      autoConnect: true,
    });
    setSocket(newSocket);{/* Cleanup on unmount or user change */}return () => {
      newSocket.disconnect();
      console.log("Disconnected from Socket.IO server");
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

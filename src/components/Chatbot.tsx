import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import SVGFile from "./SVGFile";

const socket = io("http://localhost:3005");

interface IChatBot {
  message: string;
  response: string;
  id: string;
  user_id: number;
}

const userId = 101;

const Chatbot: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<IChatBot[]>([]);

  const sendMSG = () => {
    if (inputText.trim()) {
      socket.emit("message", { message: inputText, userId });
    }
  };

  useEffect(() => {
    socket.on("response", (args: IChatBot) => {
      if (!args || !args.response.length) return;
      console.log("reveived message", args);
      setMessages((prev) => [
        ...prev,
        {
          message: inputText,
          response: args.response,
          id: args.id,
          user_id: args.user_id,
        },
      ]);
      setInputText("");
    });

    return () => {
      socket.off("response");
    };
  }, []);

  const getAllChats = () => {
    socket.emit("getAllChats", userId);
    socket.on("chats", (args) => {
      console.log("all chats", args);
      setMessages(args);
    });
  };

  useEffect(() => {
    getAllChats();
    return () => {
        socket.off("getAllChats");
    };
  }, []);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <SVGFile name="botIcon" height="40" width="40" />
      </div>
      <div className="chat-messages">
        {messages &&
          messages.length > 0 &&
          messages.map((msg, index) => {
            return (
              <div key={index}>
                {msg.message && (
                  <div className="each-chat">
                    <span style={{ marginRight: "10px" }}>
                      <SVGFile height="35" width="35" name="personIcon" />
                    </span>
                    <div className="message bot-message align-row">
                      {msg?.message}
                    </div>
                  </div>
                )}
                {msg.response && (
                  <div className="each-chat">
                    <span style={{ marginRight: "10px" }}>
                      <SVGFile height="35" width="35" name="botIcon" />
                    </span>
                    <div className="message user-message align-row">
                      {msg?.response}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
      <div className="chat-input">
        <input
          onChange={(e) => setInputText(e.target.value)}
          type="text"
          placeholder="Type your message..."
        />
        <button type="button" onClick={sendMSG}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;

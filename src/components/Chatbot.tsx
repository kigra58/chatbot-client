import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3005");

interface IChatBot {
  message: string;
  response: string;
  id: string;
  user_id: number;
}

const userId = 101;

interface IProps {
  setBotOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Chatbot: React.FC<IProps> = ({ setBotOpen }) => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<IChatBot[]>([]);
  const [isBotThinking, setIsBotThinking] = useState(false);

  const sendMSG = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBotThinking(true);
    if (inputText.trim()) {
      socket.emit("message", { message: inputText, userId });
      setInputText("");
    }
  };

  useEffect(() => {
    socket.on("responseChunk", (args: { id: string; chunk: string }) => {
      console.log("args.chunk", args.chunk);
      setMessages((prev) => {
        const updatedMessages = prev.map((msg) => {
          if (msg.id === args.id) {
            return { ...msg, response: msg.response + args.chunk };
          }
          return msg;
        });
        return updatedMessages;
      });
    });

    socket.on("response", (args: IChatBot) => {
      if (!args || !args.response.length) return;
      setIsBotThinking(false);
      console.log("args.message,args.message,",args.response);
      setMessages((prev) => [
        ...prev,
        {
          message: args.message,
          response: args.response,
          id: args.id,
          user_id: args.user_id,
        },
      ]);
    });

    socket.on("responseError", (args: { id: string; error: string }) => {
      setIsBotThinking(false);
      setMessages((prev) => {
        const updatedMessages = prev.map((msg) => {
          if (msg.id === args.id) {
            return { ...msg, response: args.error };
          }
          return msg;
        });
        return updatedMessages;
      });
    });

    return () => {
      socket.off("responseChunk");
      socket.off("response");
      socket.off("responseError");
    };
  }, []);

  const getAllChats = () => {
    socket.emit("getAllChats", userId);
    socket.on("chats", (args) => {
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
    // <div className="chatbot-container">
    //   <div className="chatbot-header">
    //     <h2>BOT</h2>
    //     <span className="close-btn">&times;</span>
    //   </div>
    //   <div className="chatbot-body">
    //     <div className="chatbot-messages">
    //       {messages.map((msg, index) => (
    //         <div key={index}>
    //           {msg.message && (
    //             <div className="message user-message">
    //               <p>{msg.message}</p>
    //             </div>
    //           )}
    //           {msg.response && (
    //             <div className="message bot-message">
    //               <p>{msg.response}</p>
    //             </div>
    //           )}
    //         </div>
    //       ))}
    //       {isBotThinking && (
    //         <div className="message bot-message">
    //           <p><i>Bot is thinking...</i></p>
    //         </div>
    //       )}
    //     </div>
    //     <form onSubmit={sendMSG} className="chatbot-input">
    //       <input
    //         type="text"
    //         placeholder="Type a message..."
    //         value={inputText}
    //         onChange={(e) => setInputText(e.target.value)}
    //       />
    //       <button type="submit">Send</button>
    //     </form>
    //   </div>
    // </div>

    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>BOT</h2>
        <span onClick={() => setBotOpen(false)} className="close-btn">
          &times;
        </span>
      </div>
      <div className="chatbot-body">
        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={index}>
              <div className="message bot-message">
                <p>{msg?.message}</p>
              </div>
              <div className="message user-message">
                <p>{msg?.response}</p>
              </div>
            </div>
          ))}

          {isBotThinking && (
            <div className="message bot-message">
              <p>
                Bot is thinking
                <span className="dot-wave">
                  <span className="dot-wave-dot"></span>
                  <span className="dot-wave-dot"></span>
                  <span className="dot-wave-dot"></span>
                </span>
              </p>
            </div>
          )}
        </div>
        <form onSubmit={sendMSG}>
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type a message..."
              onChange={(e) => setInputText(e.target.value)}
              value={inputText}
            />
            <button className="send-btn">Send</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;

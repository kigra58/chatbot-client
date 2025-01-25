import React from "react";
import "./App.css";
import Chatbot from "./components/Chatbot";
import SVGFile from "./components/SVGFile";
const App: React.FC = () => {
  const [botOpen, setBotOpen] = React.useState(false);

  return (
    <div>
      {botOpen ? (
        <Chatbot setBotOpen={setBotOpen} />
      ) : (
        <span onClick={() => setBotOpen(!botOpen)} className="bot-icon cursor-pointer">
          <SVGFile name="botIcon" height="60" width="60" />
        </span>
      )}
    </div>
  );
};

export default App;

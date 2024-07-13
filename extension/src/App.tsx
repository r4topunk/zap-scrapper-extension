import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [autoDetect, setAutoDetect] = useState(
    localStorage.getItem("autoDetectEnabled") === "true",
  );

  useEffect(() => {
    localStorage.setItem("autoDetectEnabled", autoDetect.toString());
  }, [autoDetect]);

  const toggleAutoDetect = async () => {
    setAutoDetect(!autoDetect);
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: (autoDetect) => {
        /** @ts-ignore */
        window.autoDetectEnabled = autoDetect;
        localStorage.setItem("autoDetectEnabled", autoDetect.toString());
      },
      args: [!autoDetect],
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "24px",
        borderRadius: "16px"
      }}
    >
      <h1>Zap Defender</h1>
      <button
        style={{
          backgroundColor: autoDetect ? "#FAECEC" : "#ECF6EC",
        }}
        onClick={toggleAutoDetect}
      >
        {autoDetect ? "Desligar" : "Ligar"}
      </button>
    </div>
  );
}

export default App;

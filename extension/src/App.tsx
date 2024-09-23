import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [isDetectOn, setIsDetectOn] = useState(
    localStorage.getItem("autoDetectEnabled") === "true"
  );

  const [jwtToken, setJwtToken] = useState<string | undefined>();
  const isLoggedIn = !!jwtToken;

  useEffect(() => {
    chrome.storage.local.get(["jwtToken"], (result) => {
      if (result.jwtToken) {
        console.log({ result });
        setJwtToken(result.jwtToken);
      } else {
        setJwtToken(undefined);
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("autoDetectEnabled", isDetectOn.toString());
  }, [isDetectOn]);

  const toggleAutoDetect = async () => {
    setIsDetectOn(!isDetectOn);
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: (autoDetect) => {
        /** @ts-ignore */
        window.autoDetectEnabled = autoDetect;
        localStorage.setItem("autoDetectEnabled", autoDetect.toString());
      },
      args: [!isDetectOn],
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#171717",
        minWidth: "300px",
      }}
    >
      <div
        style={{
          display: "flex",
          padding: "12px",
          borderBottom: "4px #16FF9D solid",
        }}
      >
        <img src="/logo.svg" style={{ height: "24px", marginRight: "auto" }} />
        <img
          src="/language.svg"
          style={{ width: "24px", marginRight: "4px" }}
        />
        <img src="/help.svg" style={{ width: "24px" }} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "8px",
          gap: "32px",
        }}
      >
        <h2
          style={{
            background: "linear-gradient(90deg, #3DF64F 0%, #16FF9D 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
            marginTop: "24px",
            fontSize: "32px",
          }}
        >
          Zap Defender
        </h2>
        {isLoggedIn ? (
          <>
            <button
              style={{
                backgroundColor: "#171717",
                color: isDetectOn ? "#FF4D4D" : "#16FF9D",
                border: isDetectOn ? "1px solid #FF4D4D" : "1px solid #16FF9D",
                width: "80%",
                outline: "none",
                borderRadius: "8px",
                padding: "0.6em 1.2em",
                fontSize: "1em",
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
              onClick={toggleAutoDetect}
            >
              {isDetectOn ? "Desligar" : "Ligar"}
            </button>
            <span
              style={{
                textTransform: "uppercase",
                color: "#727272",
                fontSize: "12px",
                margin: 0,
              }}
            >
              Modo de detecção{" "}
              <span
                style={{
                  fontWeight: isDetectOn ? "700" : "400",
                  color: isDetectOn ? "#16FF9D" : "#FF4D4D",
                }}
              >
                {isDetectOn ? "ativado" : "desativado"}
              </span>
            </span>
          </>
        ) : (
          <>
            <p>User not logged in</p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;

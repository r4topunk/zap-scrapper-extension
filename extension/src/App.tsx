import { useEffect, useState } from "react";
import "./App.css";

const ENDPOINT_URL = import.meta.env.VITE_ENDPOINT_URL || "";

function App() {
  const [data, setData] = useState<{
    photo?: string;
    name?: string;
    messages?: string[][];
  }>();
  const [message, setMessage] = useState("");
  const [autoDetect, setAutoDetect] = useState(
    localStorage.getItem("autoDetectEnabled") === "true",
  );

  useEffect(() => {
    localStorage.setItem("autoDetectEnabled", autoDetect.toString());
  }, [autoDetect]);

  const reportUser = async () => {
    setMessage("Reporting user");
    if (!data) return setMessage("No data found. Try again.");

    try {
      const res = await fetch(ENDPOINT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photo: data?.photo,
          name: data?.name,
          messages: data?.messages,
        }),
      });
      const json = await res.json();
      setMessage(`User reported. Chance of fraud: ${json.note}`);
    } catch (err) {
      console.error(err);
      setMessage("Report error: " + err);
    }
  };

  const onClick = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id! },
        func: () => {
          console.log("Injected script running");
          let main = document.getElementById("main");
          let header = main?.getElementsByTagName("header")[0];
          let photo = header?.getElementsByTagName("img")[0]?.src || "";

          let nameIndex = photo ? 0 : 1;
          let name =
            header?.getElementsByTagName("span")[nameIndex]?.textContent || "";
          let texts = main?.querySelectorAll("[data-pre-plain-text]");

          let messages = [];
          if (texts) {
            for (let i = 0; i < texts.length; i++) {
              let el = texts[i];
              let date = el.getAttribute("data-pre-plain-text") || "";

              let spans = el.getElementsByTagName("span");
              let textIndex =
                spans.length === 9
                  ? 1
                  : spans.length === 8 || spans.length === 10
                    ? 4
                    : 0;

              let msg = spans[textIndex]?.textContent || "";
              messages.push([date, msg]);
            }
          }

          return { name, photo, messages };
        },
      },
      (results) => {
        if (results && results.length > 0) {
          const data = results[0].result;
          setData(data);
          console.log(data);
        }
      },
    );
  };

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
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h1>Zap Scrapper</h1>
      {!data?.messages ? (
        <>
          <p>Click on the button to get the chat data</p>
          <button onClick={onClick}>Get chat</button>
        </>
      ) : null}
      {data?.name ? (
        <input type="text" disabled defaultValue={data.name} />
      ) : null}
      {data?.photo ? (
        <input type="text" disabled defaultValue={data.photo} />
      ) : null}
      {data?.messages ? (
        <>
          <textarea
            disabled
            defaultValue={data.messages
              .map((value) => `${value[0]}${value[1]}`)
              .join("\n")}
            style={{ height: "200px" }}
          />
          <button onClick={reportUser}>Report user</button>
        </>
      ) : null}
      {message ? <p>{message}</p> : null}
      <button style={{ marginTop: "8px" }} onClick={toggleAutoDetect}>
        {autoDetect ? "Disable Auto Detect" : "Enable Auto Detect"}
      </button>
    </div>
  );
}

export default App;

import { useState } from "react"
import "./App.css"

function App() {
  const [data, setData] = useState<{
    photo?: string
    name?: string
    datedValues?: string[][]
  }>()
  const onClick = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id! },
        func: () => {
          // Code inside this function is executed in the context of the webpage
          console.log("Injected script running")
          let main = document.getElementById("main")
          let header = main?.getElementsByTagName("header")[0]
          let photo = header?.getElementsByTagName("img")[0]?.src || ""

          let nameIndex = photo ? 0 : 1
          let name =
            header?.getElementsByTagName("span")[nameIndex]?.textContent || ""
          let texts = main?.querySelectorAll("[data-pre-plain-text]")

          let datedValues = []
          if (texts) {
            for (let i = 0; i < texts.length; i++) {
              let el = texts[i]
              let date = el.getAttribute("data-pre-plain-text") || ""

              let spans = el.getElementsByTagName("span")
              let textIndex =
                spans.length === 9
                  ? 1
                  : spans.length === 8 || spans.length === 10
                    ? 4
                    : 0

              let msg = spans[textIndex]?.textContent || ""
              datedValues.push([date, msg])
            }
          }

          // Return the data that needs to be sent back to the extension
          return { name, photo, datedValues }
        },
      },
      (results) => {
        // This function gets called once the script has executed
        // `results[0].result` contains the returned value from the content script
        if (results && results.length > 0) {
          const data = results[0].result
          setData(data)
          console.log(data)
        }
      }
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h1>Zap Scrapper</h1>
      {!data?.datedValues ? (
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
      {data?.datedValues ? (
        <>
          <textarea
            disabled
            defaultValue={data.datedValues
              .map((value) => `${value[0]}${value[1]}`)
              .join("\n")}
            style={{ height: "200px" }}
          />
          <button>Report user</button>
        </>
      ) : null}
    </div>
  )
}

export default App

import "./App.css"
import reactLogo from "./assets/react.svg"
import viteLogo from "/vite.svg"

function App() {
  const onClick = async () => {
    // Update page background with the color
    let [tab] = await chrome.tabs.query({ active: true })
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      args: [],
      func: () => {
        let main = document.getElementById("main")
        let header = main?.getElementsByTagName("header")[0]
        let photo = header?.getElementsByTagName("img")[0]?.src || ""

        let nameIndex = photo ? 0 : 1
        let name = header?.getElementsByTagName("span")[nameIndex].textContent
        let texts = main?.querySelectorAll("[data-pre-plain-text]")

        let datedValues: [string, string][] = []
        if (texts) {
          for (let i = 0; i < texts?.length; i++) {
            let el = texts[i]
            let date = el.getAttribute("data-pre-plain-text") as string

            let spans = el.getElementsByTagName("span")
            let textIndex
            switch (spans.length) {
              case 10:
              case 8:
                textIndex = 4
                break
              case 9:
                textIndex = 1
                break
              default:
                textIndex = 0
            }

            let msg = el.getElementsByTagName("span")[textIndex]
              .textContent as string
            datedValues.push([date, msg])
          }
        }

        console.log({
          photo,
          name,
          datedValues,
        })
      },
    })
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={onClick}>Get chat</button>
      </div>
      <p className="read-the-docs">Click on the button to get the chat data</p>
    </>
  )
}

export default App

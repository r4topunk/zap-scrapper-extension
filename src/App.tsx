import { useState } from "react"
import "./App.css"
import reactLogo from "./assets/react.svg"
import viteLogo from "/vite.svg"

function App() {
  const [colour, setColour] = useState("#000000")

  const onClick = async () => {
    // Set random colour
    setColour(
      "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
    )

    // Update page background with the color
    let [tab] = await chrome.tabs.query({ active: true })
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      args: [colour],
      func: (colour) => {
        document.body.style.backgroundColor = colour
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
        <button onClick={onClick}>Color is {colour}</button>
      </div>
      <p className="read-the-docs">
        Click on the button to change the background color
      </p>
    </>
  )
}

export default App

(function () {
  if (window.autoDetectInitialized) return;
  window.autoDetectInitialized = true;

  let autoDetectEnabled = localStorage.getItem("autoDetectEnabled") === "true";
  window.autoDetectEnabled = autoDetectEnabled;

  console.log("Injected script running");
  setInterval(() => {
    if (window.autoDetectEnabled) {
      scrapData();
    }
  }, 3000);
})();

const reportedMessages = new Set();

function scrapData() {
  console.log("scrapData called");
  let main = document.getElementById("main");
  if (!main) {
    console.log("Main não encontrado");
    return;
  }

  let header = main?.getElementsByTagName("header")[0];
  let photo = header?.getElementsByTagName("img")[0]?.src || "";

  let nameIndex = photo ? 0 : 1;
  let name = header?.getElementsByTagName("span")[nameIndex]?.textContent || "";
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

  let messagesString = JSON.stringify(messages);
  let messagesHash = generateHash(messagesString);

  if (!reportedMessages.has(messagesHash)) {
    reportedMessages.add(messagesHash);
    reportUser({ name, photo, messages });
    console.log("New messages reported", { name, photo, messages });
  } else {
    console.log("Messages already reported");
  }
  return { name, photo, messages };
}

function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

const reportUser = async (data) => {
  try {
    const res = await fetch("http://localhost:3000/api", {
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
    alert(`User ${data?.name} reported. Chance of fraud: ${json.note}`);
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

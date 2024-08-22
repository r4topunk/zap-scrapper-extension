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
  }, 10000);
})();

var reportedMessages = new Set();

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

async function reportUser(data) {
  try {
    const res = await fetch("https://ruxintel.r4topunk.xyz/api", {
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
    if (json.note > 6) {
      // alert(`User ${data?.name} reported. Chance of fraud: ${json.note}`);
      addWarningOverlay();
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

function addWarningOverlay() {
  var overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
  overlay.style.zIndex = 1000;
  overlay.style.cursor = "pointer";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";

  // Cria o aviso no centro do overlay
  var warningText = document.createElement("div");
  warningText.textContent = "CUIDADO, VOCÊ PODE ESTAR SENDO VÍTIMA DE UM GOLPE";
  warningText.style.color = "white";
  warningText.style.fontSize = "24px";
  warningText.style.fontWeight = "bold";
  warningText.style.textAlign = "center";

  // Adiciona o aviso ao overlay
  overlay.appendChild(warningText);
  // Adiciona um evento de clique para remover o overlay
  overlay.addEventListener("click", function () {
    overlay.remove();
  });

  // Adiciona o overlay na div #main
  document.querySelector("#main").appendChild(overlay);
}

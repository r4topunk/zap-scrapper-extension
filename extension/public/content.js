(function () {
  if (window.autoDetectInitialized) return;
  window.autoDetectInitialized = true;

  let autoDetectEnabled = localStorage.getItem("autoDetectEnabled") === "true";
  window.autoDetectEnabled = autoDetectEnabled;

  console.log("Injected script running");
  setInterval(async () => {
    let autoDetectEnabled =
      localStorage.getItem("autoDetectEnabled") === "true";
    window.autoDetectEnabled = autoDetectEnabled;
    if (!autoDetectEnabled) return;

    const name = getChatName();
    const warningIgnored = await checkWarningStatus(name);
    if (warningIgnored == true || warningIgnored === undefined) {
      scrapData();
    }
  }, 5000);
})();

function getChatName() {
  const currentMain = document.querySelector("#main header");
  if (!currentMain) return null;
  const name = currentMain.getElementsByTagName("span")[0]?.textContent || null;
  return name === "default-user"
    ? currentMain.getElementsByTagName("span")[1]?.textContent || null
    : name;
}

async function scrapData() {
  console.log("scrapData called");
  let main = document.getElementById("main");
  if (!main) {
    console.log("Main não encontrado");
    return;
  }

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

  if (messages.length > 10) messages = messages.slice(-10);

  let messagesString = JSON.stringify(messages);
  let messagesHash = generateHash(messagesString);

  // if (!reportedMessages.has(messagesHash)) {
  if (!(await checkIfMessageExists(messagesHash))) {
    let header = main?.getElementsByTagName("header")[0];
    let photo = header?.getElementsByTagName("img")[0]?.src || "";
    let nameIndex = photo ? 0 : 1;
    let name =
      header?.getElementsByTagName("span")[nameIndex]?.textContent || "";

    // reportedMessages.add(messagesHash);
    await storeMessage(messagesHash, { name, photo, messages });
    reportUser({ name, photo, messages });
    console.log("New messages reported", {
      name,
      photo,
      messages,
      messagesHash,
    });

    return true;
  } else {
    console.log("Messages already reported");
    return false;
  }
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

    console.log("Server response:", json);
    if (json.note >= 8) {
      // alert(`User ${data?.name} reported. Chance of fraud: ${json.note}`);
      addWarningOverlay(data.name);
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

async function addWarningOverlay(name) {
  if (document.getElementById("overlay-zap-defender")) return;

  var overlay = document.createElement("div");
  overlay.id = "overlay-zap-defender";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
  overlay.style.zIndex = 1000;
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.gap = "8px";

  // Cria o aviso no centro do overlay
  var warningText = document.createElement("div");
  warningText.textContent = "CUIDADO, VOCÊ PODE ESTAR SENDO VÍTIMA DE UM GOLPE";
  warningText.style.color = "white";
  warningText.style.fontSize = "24px";
  warningText.style.fontWeight = "bold";
  warningText.style.textAlign = "center";

  // Cria o aviso no centro do overlay
  var ignoreButton = document.createElement("div");
  ignoreButton.textContent = "ignorar";
  ignoreButton.style.color = "white";
  ignoreButton.style.fontSize = "16px";
  ignoreButton.style.textAlign = "center";
  ignoreButton.style.cursor = "pointer";

  // Adiciona um evento de clique para remover o overlay
  ignoreButton.addEventListener("click", async function () {
    overlay.remove();
    await storeWarningStatus(name, true);
  });

  // Adiciona o aviso ao overlay
  overlay.appendChild(warningText);
  overlay.appendChild(ignoreButton);

  // Adiciona o overlay na div #main
  document.querySelector("#main").appendChild(overlay);
  await storeWarningStatus(name, false);
}

// Função para monitorar mudanças no #main
var lastOpenChat = null;

function monitorMainChanges() {
  setInterval(async () => {
    let autoDetectEnabled =
      localStorage.getItem("autoDetectEnabled") === "true";
    window.autoDetectEnabled = autoDetectEnabled;
    if (!autoDetectEnabled) return;

    let name = getChatName();

    if (name && lastOpenChat !== name) {
      console.log("Last:", lastOpenChat);
      lastOpenChat = name;
      console.log("Checking", name);
      const warningIgnored = await checkWarningStatus(name);

      if (warningIgnored == false) {
        addWarningOverlay(name);
      }
    }
  }, 1000);
}

// Inicia o monitoramento
monitorMainChanges();

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("MessageDatabase", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("messages")) {
        db.createObjectStore("messages", { keyPath: "hash" });
      }
      if (!db.objectStoreNames.contains("warnings")) {
        const store = db.createObjectStore("warnings", { keyPath: "name" });
        store.createIndex("name", "name", { unique: true });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Erro ao abrir IndexedDB:", event.target.errorCode);
    };
  });
}

async function storeMessage(hash, data) {
  const db = await openDatabase();
  const transaction = db.transaction(["messages"], "readwrite");
  const objectStore = transaction.objectStore("messages");

  return new Promise((resolve, reject) => {
    const request = objectStore.add({ hash: hash, data: data });
    request.onsuccess = () => {
      resolve(true);
    };
    request.onerror = () => {
      resolve(false);
    };
  });
}

async function checkIfMessageExists(hash) {
  const db = await openDatabase();
  const transaction = db.transaction(["messages"], "readonly");
  const objectStore = transaction.objectStore("messages");

  return new Promise((resolve) => {
    const request = objectStore.get(hash);
    request.onsuccess = () => {
      resolve(!!request.result);
    };
    request.onerror = () => {
      resolve(false);
    };
  });
}

async function checkWarningStatus(name) {
  const db = await openDatabase();
  const transaction = db.transaction(["warnings"], "readonly");
  const store = transaction.objectStore("warnings");

  console.log("Checking latest warning for", name);

  return new Promise((resolve) => {
    const index = store.index("name");
    const cursorRequest = index.openCursor(name, "prev"); // "prev" para iterar na ordem inversa

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        console.log(`Last warning for ${name}:`, cursor.value);
        resolve(cursor.value.ignored);
      } else {
        resolve(undefined); // Não encontrou nenhum registro
      }
    };

    cursorRequest.onerror = () => {
      resolve(undefined); // Em caso de erro na operação
    };
  });
}

async function storeWarningStatus(name, ignored) {
  const db = await openDatabase();
  const transaction = db.transaction(["warnings"], "readwrite");
  const store = transaction.objectStore("warnings");

  return new Promise((resolve) => {
    const request = store.put({ name: name, ignored: ignored });
    request.onsuccess = () => {
      resolve(true);
    };
    request.onerror = () => {
      resolve(false);
    };
  });
}

/*
 * Função autoexecutável que inicializa o monitoramento de mensagens e verifica se o script já foi iniciado anteriormente.
 * Caso contrário, ativa o monitoramento periódico das mensagens no chat.
 */
(function () {
  if (window.autoDetectInitialized) return;
  window.autoDetectInitialized = true;

  let autoDetectEnabled = localStorage.getItem("autoDetectEnabled") === "true";
  window.autoDetectEnabled = autoDetectEnabled;

  console.log("ZapScrapper: Injected script running");
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

/*
 * Obtém o nome do chat atual a partir do elemento HTML.
 * Retorna null se o nome não puder ser encontrado.
 */
function getChatName() {
  const currentMain = document.querySelector("#main header");
  if (!currentMain) return null;
  const name = currentMain.getElementsByTagName("span")[0]?.textContent || null;
  return name === "default-user"
    ? currentMain.getElementsByTagName("span")[1]?.textContent || null
    : name;
}

/*
 * Coleta dados das mensagens visíveis no chat e verifica se já foram reportadas.
 * Se as mensagens forem novas, elas são armazenadas e reportadas.
 */
async function scrapData() {
  console.log("ZapScrapper: scrapData called");
  let main = document.getElementById("main");
  if (!main) {
    console.log("ZapScrapper: Main não encontrado");
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
    console.log("ZapScrapper: New messages reported", {
      name,
      photo,
      messages,
      messagesHash,
    });

    return true;
  } else {
    console.log("ZapScrapper: Messages already reported");
    return false;
  }
}

/*
 * Gera um hash de 32 bits a partir de uma string, utilizando um algoritmo simples de deslocamento e adição.
 * Retorna o hash como uma string.
 */
function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

/*
 * Envia os dados do usuário para o servidor, incluindo nome, foto e mensagens.
 * Caso a nota de alerta seja alta, exibe um overlay de aviso para o usuário.
 */
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

    console.log("ZapScrapper: Server response:", json);
    if (json.nota >= 8 || json.note >= 8) {
      // alert(`User ${data?.name} reported. Chance of fraud: ${json.note}`);
      addWarningOverlay(data.name);
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

/*
 * Adiciona um overlay de aviso na tela do usuário, alertando sobre um possível golpe.
 * O overlay oferece a opção de ignorar o aviso, e o status é armazenado no IndexedDB.
 */
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

/*
 * Monitora as mudanças no chat principal e exibe o overlay de aviso se necessário, de acordo com o status de alerta.
 */
function monitorMainChanges() {
  setInterval(async () => {
    let autoDetectEnabled =
      localStorage.getItem("autoDetectEnabled") === "true";
    window.autoDetectEnabled = autoDetectEnabled;
    if (!autoDetectEnabled) return;

    let name = getChatName();

    if (name && lastOpenChat !== name) {
      console.log("ZapScrapper: Last:", lastOpenChat);
      lastOpenChat = name;
      console.log("ZapScrapper: Checking", name);
      const warningIgnored = await checkWarningStatus(name);

      if (warningIgnored == false) {
        addWarningOverlay(name);
      }
    }
  }, 1000);
}

// Inicia o monitoramento
monitorMainChanges();

/*
 * Abre ou cria a base de dados IndexedDB para armazenar mensagens e status de alertas.
 * Resolve com o objeto de banco de dados aberto ou rejeita em caso de erro.
 */
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

/*
 * Armazena uma nova mensagem no IndexedDB, associada ao hash gerado.
 * Retorna true se o armazenamento for bem-sucedido, ou false caso contrário.
 */
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

/*
 * Verifica se uma mensagem já foi armazenada no IndexedDB, utilizando o hash.
 * Retorna true se a mensagem já existir, ou false caso contrário.
 */
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

/*
 * Verifica o status de alerta para um usuário específico no IndexedDB.
 * Retorna o status 'ignored' (se o alerta foi ignorado) ou undefined se nenhum alerta for encontrado.
 */
async function checkWarningStatus(name) {
  const db = await openDatabase();
  const transaction = db.transaction(["warnings"], "readonly");
  const store = transaction.objectStore("warnings");

  console.log("ZapScrapper: Checking latest warning for", name);

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

/*
 * Armazena o status de alerta (se foi ignorado ou não) para um determinado usuário no IndexedDB.
 * Retorna true se o armazenamento for bem-sucedido, ou false caso contrário.
 */
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

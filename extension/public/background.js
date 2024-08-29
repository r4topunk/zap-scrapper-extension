chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
      changeInfo.status === "complete" &&
      /^https:\/\/web.whatsapp.com/.test(tab.url)
    ) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["whatsapp.js"],
      });
    }
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
      changeInfo.status === "complete" &&
      /^https:\/\/ruxintel.r4topunk.xyz/.test(tab.url)
    ) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["ruxintel.js"],
      });
    }
  });
});

// Escuta mensagens do content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.jwtToken) {
    // Armazena o JWT em chrome.storage.local
    chrome.storage.local.set({ jwtToken: request.jwtToken }, function () {
      console.log("JWT salvo em chrome.storage.local.");
      sendResponse({ status: "JWT armazenado com sucesso" });
    });
  }
  return true; // Indica que a resposta será enviada de forma assíncrona
});

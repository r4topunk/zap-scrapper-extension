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

chrome.cookies.onChanged.addListener(
  (changeInfo) => {
    const cookie =  changeInfo.cookie;
    if (cookie.domain == "ruxintel.r4topunk.xyz" && cookie.name == "sessionToken") {
      chrome.storage.local.set({ jwtToken: cookie.value }, function () {
        console.log("JWT salvo em chrome.storage.local.", cookie);
        sendResponse({ status: "JWT armazenado com sucesso" });
      });
    }
  }
)
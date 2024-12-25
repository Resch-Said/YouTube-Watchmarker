chrome.runtime.onInstalled.addListener(() => {
  console.log("[Watchmarker] Extension installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SAVE_WATCH_HISTORY") {
    chrome.storage.local.get("watchHistory", (data) => {
      const watchHistory = data.watchHistory || [];
      const videoExists = watchHistory.some(
        (video) => video.id === message.video.id
      );

      if (!videoExists) {
        watchHistory.push(message.video);
        chrome.storage.local.set({ watchHistory }, () => {
          sendResponse({ status: "success" });
        });
      } else {
        sendResponse({ status: "exists" });
      }
    });
    return true;
  } else if (message.type === "CLEAR_WATCH_HISTORY") {
    chrome.storage.local.set({ watchHistory: [] }, () => {
      sendResponse({ status: "cleared" });
    });
    return true;
  }
});

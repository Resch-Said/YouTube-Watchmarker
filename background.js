// Minimaler Logger für Produktionsumgebung
const Logger = {
  error: (...args) => console.error("[Watchmarker]", ...args),
  warn: (...args) => console.warn("[Watchmarker]", ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV === "development") {
      console.debug("[Watchmarker]", ...args);
    }
  },
};

// Storage Management
const StorageManager = {
  async getWatchedVideos() {
    try {
      const result = await chrome.storage.local.get(["watchedVideos"]);
      return result.watchedVideos || {};
    } catch (error) {
      Logger.error("Error getting watched videos:", error);
      return {};
    }
  },

  async addWatchedVideo(videoId) {
    try {
      const videos = await this.getWatchedVideos();
      if (videos[videoId]) return false;

      videos[videoId] = {
        timestamp: new Date().toISOString(),
        watched: true,
      };

      await chrome.storage.local.set({ watchedVideos: videos });
      return true;
    } catch (error) {
      Logger.error("Error adding watched video:", error);
      return false;
    }
  },

  async removeWatchedVideo(videoId) {
    try {
      const videos = await this.getWatchedVideos();
      if (!videos[videoId]) return false;

      delete videos[videoId];
      await chrome.storage.local.set({ watchedVideos: videos });
      return true;
    } catch (error) {
      Logger.error("Error removing watched video:", error);
      return false;
    }
  },

  async clearWatchedVideos() {
    try {
      await chrome.storage.local.set({ watchedVideos: {} });
      return true;
    } catch (error) {
      Logger.error("Error clearing watched videos:", error);
      return false;
    }
  },
};

// Message Handler
const MessageHandler = {
  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case "getWatchedVideos":
          const videos = await StorageManager.getWatchedVideos();
          sendResponse(videos);
          break;

        case "addWatchedVideo":
        case "VIDEO_WATCHED":
          const success = await StorageManager.addWatchedVideo(message.videoId);
          sendResponse({ success });
          break;

        case "removeWatchedVideo":
          const removed = await StorageManager.removeWatchedVideo(
            message.videoId
          );
          sendResponse({ success: removed });
          break;

        case "clearWatchedVideos":
          const cleared = await StorageManager.clearWatchedVideos();
          sendResponse({ success: cleared });
          break;

        default:
          Logger.warn("Unknown message type:", message.type);
          sendResponse({ error: "Unknown message type" });
      }
    } catch (error) {
      Logger.error("Message handling error:", error);
      sendResponse({ error: error.message });
    }
  },
};

// Event Listeners
chrome.runtime.onInstalled.addListener(async () => {
  const videos = await StorageManager.getWatchedVideos();
  if (Object.keys(videos).length === 0) {
    await StorageManager.addWatchedVideo("9gzueArx34A");
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  MessageHandler.handleMessage(message, sender, sendResponse);
  return true; // Wichtig für asynchrone Antworten
});

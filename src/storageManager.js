const STORAGE_KEYS = {
  WATCH_HISTORY: "watchHistory",
  SETTINGS: "settings",
};

const DEFAULT_SETTINGS = {
  thresholds: {
    standard: {
      enabled: true,
      time: 30,
      percent: 50,
      percentMode: "position",
    },
    shorts: {
      enabled: true,
      time: 15,
      percent: 30,
      percentMode: "position",
    },
    hover: {
      enabled: true,
      time: 30,
      percent: 50,
      percentMode: "position",
    },
  },
  ui: {
    grayscale: true,
    labels: true,
    dateFormat: "DD.MM.YYYY",
  },
};

class StorageManager {
  constructor() {
    this.storage = chrome.storage.local;
  }

  async saveProgress(videoId, progress, videoTitle = "") {
    try {
      const history = await this.getWatchHistory();
      const currentEntry = history[videoId] || { watchCount: 0 };

      history[videoId] = {
        ...progress,
        title: videoTitle,
        lastUpdated: Date.now(),
        watchCount: progress.completed
          ? (currentEntry.watchCount || 0) + 1
          : currentEntry.watchCount || 0,
      };

      try {
        await this.storage.set({ [STORAGE_KEYS.WATCH_HISTORY]: history });
        return true;
      } catch (error) {
        console.error("Error saving to storage:", error);
        return false;
      }
    } catch (error) {
      console.error("Error in saveProgress:", error);
      return false;
    }
  }

  async getWatchHistory() {
    try {
      const result = await this.storage.get(STORAGE_KEYS.WATCH_HISTORY);
      return result[STORAGE_KEYS.WATCH_HISTORY] || {};
    } catch (error) {
      console.error("Error getting watch history:", error);
      return {};
    }
  }

  async getVideoProgress(videoId) {
    try {
      const history = await this.getWatchHistory();
      return history[videoId] || null;
    } catch (error) {
      console.error("Error getting video progress:", error);
      return null;
    }
  }

  async clearProgress(videoId) {
    try {
      const history = await this.getWatchHistory();
      if (history[videoId]) {
        delete history[videoId];
        await this.storage.set({ [STORAGE_KEYS.WATCH_HISTORY]: history });
      }
      return true;
    } catch (error) {
      console.error("Error clearing progress:", error);
      return false;
    }
  }

  async clearAllProgress() {
    try {
      await this.storage.remove(STORAGE_KEYS.WATCH_HISTORY);
      return true;
    } catch (error) {
      console.error("Error clearing all progress:", error);
      return false;
    }
  }

  async getSettings() {
    try {
      const result = await this.storage.get([STORAGE_KEYS.SETTINGS]);
      return result?.[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
    } catch (error) {
      console.error("Error getting settings:", error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings) {
    try {
      await this.storage.set({
        [STORAGE_KEYS.SETTINGS]: {
          ...DEFAULT_SETTINGS,
          ...settings,
        },
      });
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      return false;
    }
  }

  async resetSettings() {
    try {
      await this.storage.set({ [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS });
      return true;
    } catch (error) {
      console.error("Error resetting settings:", error);
      return false;
    }
  }
}

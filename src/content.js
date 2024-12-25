const storageModulePath = chrome.runtime.getURL("src/storageManager.js");
const utilsModulePath = chrome.runtime.getURL("src/videoUtils.js");

async function initializeContentScript() {
  const { StorageManager } = await import(storageModulePath);
  const utils = await import(utilsModulePath);

  class ContentScript {
    constructor() {
      this.storageManager = new StorageManager();
      this.activeVideos = new Map();
      this.utils = utils;
      console.log("[Watchmarker] Content Script initialized");
      this.initObserver();
      this.initMessageListener();
    }

    initObserver() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === "VIDEO") {
              this.handleNewVideo(node);
            }
            // Suche nach neuen Thumbnails
            const thumbnails = node.querySelectorAll("ytd-thumbnail");
            thumbnails.forEach((thumb) => this.processThumbnail(thumb));
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    async handleNewVideo(videoElement) {
      const videoId = this.getVideoIdFromPage();
      if (!videoId) {
        console.log("[Watchmarker] Kein Video-ID gefunden");
        return;
      }

      console.log(`[Watchmarker] Neues Video erkannt: ${videoId}`);
      const videoType = window.location.pathname.includes("/shorts/")
        ? this.utils.VIDEO_TYPES.SHORTS
        : this.utils.VIDEO_TYPES.STANDARD;

      const handler = this.utils.handleVideoPlayback(
        videoElement,
        videoId,
        videoType
      );
      this.activeVideos.set(videoId, handler);

      // Überprüfe regelmäßig den Fortschritt
      setInterval(async () => {
        const progress = handler.getWatchProgress();
        console.log(`[Watchmarker] Video ${videoId} Fortschritt:`, {
          accumulatedTime: progress.accumulatedTime,
          completed: progress.completed,
        });

        if (progress.completed) {
          console.log(`[Watchmarker] Video ${videoId} als gesehen markiert`);
          await this.storageManager.saveProgress(videoId, progress);
          this.markThumbnailsAsWatched(videoId);
        }
      }, 1000);
    }

    async processThumbnail(thumbnail) {
      const videoId = thumbnail.getAttribute("video-id");
      if (!videoId) return;

      const progress = await this.storageManager.getVideoProgress(videoId);
      if (progress?.completed) {
        await this.utils.markVideoAsWatched(thumbnail, progress.watchedAt);
      }
    }

    getVideoIdFromPage() {
      const url = window.location.href;
      return this.utils.getVideoIdFromUrl(url);
    }

    async markThumbnailsAsWatched(videoId) {
      const thumbnails = document.querySelectorAll(
        `ytd-thumbnail[video-id="${videoId}"]`
      );
      const watchDate = Date.now();

      thumbnails.forEach(async (thumbnail) => {
        await this.utils.markVideoAsWatched(thumbnail, watchDate);
      });
    }

    initMessageListener() {
      chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "SETTINGS_UPDATED") {
          // Aktualisiere alle sichtbaren Thumbnails
          const thumbnails = document.querySelectorAll("ytd-thumbnail");
          thumbnails.forEach((thumb) => this.processThumbnail(thumb));
        }
      });
    }
  }

  // Starte Content Script
  new ContentScript();
}

// Starte Initialisierung
initializeContentScript().catch(console.error);

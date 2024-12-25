const storageModulePath = chrome.runtime.getURL("src/storageManager.js");
const utilsModulePath = chrome.runtime.getURL("src/videoUtils.js");

async function initializeContentScript() {
  console.log("[Watchmarker] Starting initialization...");
  
  try {
    const { StorageManager } = await import(storageModulePath);
    console.log("[Watchmarker] StorageManager loaded");
    
    const utils = await import(utilsModulePath);
    console.log("[Watchmarker] Utils loaded");

    class ContentScript {
      constructor() {
        console.log("[Watchmarker] Creating ContentScript instance");
        this.storageManager = new StorageManager();
        this.activeVideos = new Map();
        
        // Explizite Zuweisung der benötigten Funktionen
        const {
          VIDEO_TYPES,
          getVideoIdFromUrl,
          handleVideoPlayback,
          markVideoAsWatched
        } = utils;
        
        this.getVideoIdFromUrl = getVideoIdFromUrl;
        this.handleVideoPlayback = handleVideoPlayback;
        this.markVideoAsWatched = markVideoAsWatched;
        this.VIDEO_TYPES = VIDEO_TYPES;
        
        console.log("[Watchmarker] Content Script initialized");
        
        // Sofort nach Video suchen
        const existingVideo = document.querySelector('video');
        if (existingVideo) {
          console.log("[Watchmarker] Found existing video element");
          this.handleNewVideo(existingVideo);
        }
        
        this.initObserver();
        this.initMessageListener();
        console.log("[Watchmarker] ContentScript initialization complete");
      }

      initObserver() {
        const searchNodeForContent = (node) => {
          // Sicherheitsprüfung für Node-Typ
          if (!node || node.nodeType !== Node.ELEMENT_NODE) {
            return;
          }

          try {
            // Prüfe den Node selbst
            if (node instanceof HTMLVideoElement) {
              this.handleNewVideo(node);
            }
            
            if (node instanceof HTMLElement) {
              // Prüfe ob der Node selbst ein Thumbnail ist
              if (node.matches("ytd-thumbnail")) {
                this.processThumbnail(node);
                this.initThumbnailHover(node);
              }

              // Suche nach Thumbnails innerhalb des Elements
              const thumbnails = Array.from(node.getElementsByTagName("ytd-thumbnail"));
              thumbnails.forEach(thumb => {
                this.processThumbnail(thumb);
                this.initThumbnailHover(thumb);
              });
            }
          } catch (error) {
            console.error("[Watchmarker] Error processing node:", error);
          }
        };

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            // Verarbeite hinzugefügte Nodes
            mutation.addedNodes.forEach(searchNodeForContent);
            
            // Verarbeite auch den Target-Node selbst
            searchNodeForContent(mutation.target);
          });
        });

        // Starte Beobachtung
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        console.log("[Watchmarker] MutationObserver initialized");
        
        // Initial Scan der Seite
        searchNodeForContent(document.body);
      }

      async handleNewVideo(videoElement) {
        const videoId = this.getVideoIdFromPage();
        if (!videoId) {
          console.log("[Watchmarker] Kein Video-ID gefunden");
          return;
        }

        console.log(`[Watchmarker] Neues Video erkannt: ${videoId}`);
        const videoType = window.location.pathname.includes("/shorts/")
          ? this.VIDEO_TYPES.SHORTS
          : this.VIDEO_TYPES.STANDARD;

        const handler = this.handleVideoPlayback(
          videoElement,
          videoId,
          videoType
        );
        this.activeVideos.set(videoId, handler);

        // Überprüfe regelmäßig den Fortschritt
        const progressInterval = setInterval(async () => {
          const progress = handler.getWatchProgress();
          console.log(`[Watchmarker] Video ${videoId} Fortschritt:`, {
            accumulatedTime: progress.accumulatedTime,
            completed: progress.completed,
          });

          if (progress.accumulatedTime >= this.WATCH_THRESHOLDS[videoType].time || 
              progress.completed) {
            // Speichern mit Titel
            const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent || '';
            await this.storageManager.saveProgress(videoId, progress, videoTitle);
            
            if (progress.completed) {
              this.markThumbnailsAsWatched(videoId);
              clearInterval(progressInterval); // Stoppe Tracking wenn komplett
            }
          }
        }, 1000);
      }

      async processThumbnail(thumbnail) {
        const videoId = thumbnail.getAttribute("video-id");
        if (!videoId) return;

        const progress = await this.storageManager.getVideoProgress(videoId);
        if (progress?.completed) {
          await this.markVideoAsWatched(thumbnail, progress.watchedAt);
        }
      }

      getVideoIdFromPage() {
        const url = window.location.href;
        return this.getVideoIdFromUrl(url);
      }

      async markThumbnailsAsWatched(videoId) {
        const thumbnails = document.querySelectorAll(
          `ytd-thumbnail[video-id="${videoId}"]`
        );
        const watchDate = Date.now();

        thumbnails.forEach(async (thumbnail) => {
          await this.markVideoAsWatched(thumbnail, watchDate);
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

      initThumbnailHover(thumbnail) {
        let hoverVideo = null;
        let hoverStartTime = 0;

        thumbnail.addEventListener('mouseenter', () => {
          hoverStartTime = Date.now();
          const checkForVideo = setInterval(() => {
            hoverVideo = thumbnail.querySelector('video');
            if (hoverVideo) {
              clearInterval(checkForVideo);
              this.handleNewVideo(hoverVideo);
            }
          }, 100);
        });

        thumbnail.addEventListener('mouseleave', () => {
          if (hoverVideo) {
            const hoverDuration = (Date.now() - hoverStartTime) / 1000;
            console.log(`[Watchmarker] Hover duration: ${hoverDuration}s`);
            hoverVideo = null;
          }
        });
      }
    }

    console.log("[Watchmarker] Creating new ContentScript instance");
    new ContentScript();
  } catch (error) {
    console.error("[Watchmarker] Initialization error:", error);
  }
}

// Starte Initialisierung und logge Fehler
console.log("[Watchmarker] Content script file loaded");
initializeContentScript().catch(error => {
  console.error("[Watchmarker] Top-level initialization error:", error);
});

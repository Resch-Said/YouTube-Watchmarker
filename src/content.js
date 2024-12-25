import { getVideoIdFromUrl, handleVideoPlayback, VIDEO_TYPES, markVideoAsWatched } from './videoUtils.js';
import { StorageManager } from './storageManager.js';

class ContentScript {
  constructor() {
    this.storageManager = new StorageManager();
    this.activeVideos = new Map();
    this.initObserver();
    this.initMessageListener();
  }

  initObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'VIDEO') {
            this.handleNewVideo(node);
          }
          // Suche nach neuen Thumbnails
          const thumbnails = node.querySelectorAll('ytd-thumbnail');
          thumbnails.forEach(thumb => this.processThumbnail(thumb));
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  async handleNewVideo(videoElement) {
    const videoId = this.getVideoIdFromPage();
    if (!videoId) return;

    const videoType = window.location.pathname.includes('/shorts/') 
      ? VIDEO_TYPES.SHORTS 
      : VIDEO_TYPES.STANDARD;

    const handler = handleVideoPlayback(videoElement, videoId, videoType);
    this.activeVideos.set(videoId, handler);

    // Überprüfe regelmäßig den Fortschritt
    setInterval(async () => {
      const progress = handler.getWatchProgress();
      if (progress.completed) {
        await this.storageManager.saveProgress(videoId, progress);
        this.markThumbnailsAsWatched(videoId);
      }
    }, 1000);
  }

  async processThumbnail(thumbnail) {
    const videoId = thumbnail.getAttribute('video-id');
    if (!videoId) return;

    const progress = await this.storageManager.getVideoProgress(videoId);
    if (progress?.completed) {
      await markVideoAsWatched(thumbnail, progress.watchedAt);
    }
  }

  getVideoIdFromPage() {
    const url = window.location.href;
    return getVideoIdFromUrl(url);
  }

  async markThumbnailsAsWatched(videoId) {
    const thumbnails = document.querySelectorAll(`ytd-thumbnail[video-id="${videoId}"]`);
    const watchDate = Date.now();
    
    thumbnails.forEach(async (thumbnail) => {
      await markVideoAsWatched(thumbnail, watchDate);
    });
  }

  initMessageListener() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'SETTINGS_UPDATED') {
        // Aktualisiere alle sichtbaren Thumbnails
        const thumbnails = document.querySelectorAll('ytd-thumbnail');
        thumbnails.forEach(thumb => this.processThumbnail(thumb));
      }
    });
  }
}

// Starte Content Script
new ContentScript();

function applyGrayscaleEffect(videoId) {
  // Finde alle Thumbnails für das Video
  const thumbnails = document.querySelectorAll(`ytd-thumbnail[video-id="${videoId}"]`);
  
  thumbnails.forEach(thumbnail => {
    thumbnail.classList.add('watched-thumbnail');
  });
}

// Füge dies zur existierenden handleVideoPlayback Funktion hinzu
if (state.progressChecked) {
  applyGrayscaleEffect(videoId);
}
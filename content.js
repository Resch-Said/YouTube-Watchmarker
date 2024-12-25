// Konstanten
const CONSTANTS = {
  CACHE_UPDATE_INTERVAL: 30000,
  PROCESS_INTERVAL: 3000,
  THROTTLE_DELAY: 1500,
  HOVER_CHECK_INTERVAL: 250,
};

// State Management
const state = {
  watchHistoryCache: null,
  isProcessing: false,
  settings: {
    watchedTime: 30,
    watchedProgress: 50,
    useCustomShortsSettings: true,
    shortsWatchedTime: 15,
    shortsWatchedProgress: 30,
    useCustomHoverSettings: true,
    hoverWatchedTime: 30,
    hoverWatchedProgress: 50,
  },
  processedVideos: new Set(),
  processedHovers: new Set(),
  hoverStates: new Map(),
  activeHoverHandlers: new Map(),
  currentShortsId: null,
};

// Settings Management
function loadSettings() {
  chrome.storage.local.get(
    [
      "watchedTime",
      "watchedProgress",
      "useCustomShortsSettings",
      "shortsWatchedTime",
      "shortsWatchedProgress",
      "useCustomHoverSettings",
      "hoverWatchedTime",
      "hoverWatchedProgress",
    ],
    (data) => {
      state.settings = {
        watchedTime: data.watchedTime || 30,
        watchedProgress: data.watchedProgress || 50,
        useCustomShortsSettings: data.useCustomShortsSettings ?? true,
        shortsWatchedTime: data.shortsWatchedTime || 15,
        shortsWatchedProgress: data.shortsWatchedProgress || 30,
        useCustomHoverSettings: data.useCustomHoverSettings ?? true,
        hoverWatchedTime: data.hoverWatchedTime || 30,
        hoverWatchedProgress: data.hoverWatchedProgress || 50,
      };
    }
  );
}

// Video ID Extraction
function getVideoIdFromUrl(url) {
  try {
    // Für relative URLs (Shorts)
    if (url.startsWith("/shorts/")) {
      return url.split("/shorts/")[1];
    }

    // Für absolute URLs
    const urlObj = new URL(url);
    if (urlObj.pathname.includes("/shorts/")) {
      return urlObj.pathname.split("/shorts/")[1];
    }
    return urlObj.searchParams.get("v");
  } catch (error) {
    console.error("[Watchmarker] Error extracting video ID:", error);
    return null;
  }
}

// Video Type Detection
function getVideoType(isHoverPreview, isShort) {
  if (isShort) {
    return isHoverPreview ? "Shorts-Hover" : "Shorts";
  }
  return isHoverPreview ? "Hover" : "Normal";
}

// Threshold Management
function getThresholds(isShorts, isHover) {
  if (isHover) {
    if (!state.settings.useCustomHoverSettings) {
      return {
        time: state.settings.watchedTime,
        progress: state.settings.watchedProgress,
      };
    }
    return {
      time: state.settings.hoverWatchedTime,
      progress: state.settings.hoverWatchedProgress,
    };
  }

  if (isShorts) {
    if (!state.settings.useCustomShortsSettings) {
      return {
        time: state.settings.watchedTime,
        progress: state.settings.watchedProgress,
      };
    }
    return {
      time: state.settings.shortsWatchedTime,
      progress: state.settings.shortsWatchedProgress,
    };
  }

  return {
    time: state.settings.watchedTime,
    progress: state.settings.watchedProgress,
  };
}

// Video Playback Handling
function handleVideoPlayback(
  videoPlayer,
  videoId,
  isHoverPreview = false,
  isShort = false
) {
  if (!videoPlayer || !videoId) return null;

  const state = isHoverPreview
    ? getOrCreateHoverState(videoId)
    : {
        progressChecked: false,
        accumulatedTime: 0,
        lastTimeUpdate: Date.now(),
        active: true,
      };

  state.active = true;

  const timeUpdateHandler = () => {
    if (!state.active) return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - state.lastTimeUpdate) / 1000;
    state.lastTimeUpdate = currentTime;

    if (!videoPlayer.paused && !isNaN(deltaTime)) {
      state.accumulatedTime += deltaTime;
    }

    const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;

    if (!isNaN(progress) && !isNaN(state.accumulatedTime)) {
      const videoType = getVideoType(isHoverPreview, isShort);
      const thresholds = getThresholds(isShort, isHoverPreview);

      // Verbessertes Logging
      console.log(
        `[Watchmarker] ${videoType}:`,
        `Akkumuliert: ${state.accumulatedTime.toFixed(1)}s`,
        `Aktuell: ${videoPlayer.currentTime.toFixed(
          1
        )}s/${videoPlayer.duration.toFixed(1)}s`,
        `(${progress.toFixed(1)}%)`,
        `Ziel: ${thresholds.time}s/${thresholds.progress}%`
      );

      if (
        !state.progressChecked &&
        (state.accumulatedTime >= thresholds.time ||
          progress >= thresholds.progress)
      ) {
        state.progressChecked = true;
        saveWatchHistory({
          id: videoId,
          date: new Date().toLocaleDateString(),
        });
        cleanup();
      }
    }
  };

  const cleanup = () => {
    if (!state.active) return;
    state.active = false;
    videoPlayer.removeEventListener("timeupdate", timeUpdateHandler);
    videoPlayer.removeEventListener("ended", onEnded);
    if (isHoverPreview) {
      videoPlayer.removeEventListener("mouseleave", cleanup);
      // Nicht den State aus hoverStates entfernen, nur deaktivieren
    }
    console.log("[Watchmarker] Cleanup für Video:", videoId);
  };

  const onEnded = () => {
    if (!state.progressChecked) {
      saveWatchHistory({
        id: videoId,
        date: new Date().toLocaleDateString(),
      });
    }
    cleanup();
  };

  videoPlayer.addEventListener("timeupdate", timeUpdateHandler);
  videoPlayer.addEventListener("ended", onEnded);

  if (isHoverPreview) {
    videoPlayer.addEventListener("mouseleave", cleanup);
  }

  return { cleanup, videoId, state };
}

// DOM Manipulation
const domUtils = {
  createWatchedLabel(text) {
    const label = document.createElement("div");
    label.className = "watched-label";
    label.textContent = text;
    label.style.cssText =
      "position:absolute;top:4px;left:4px;background-color:rgba(0,0,0,0.7);color:white;padding:2px 5px;z-index:1000;pointer-events:none;";
    return label;
  },

  createDateLabel(date) {
    const label = document.createElement("div");
    label.textContent = date;
    label.style.cssText =
      "position:absolute;top:4px;right:4px;background-color:rgba(0,0,0,0.7);color:white;padding:2px 5px;z-index:1000;pointer-events:none;";
    return label;
  },
};

// Hover Management
function setupHoverTracking() {
  // Vereinfachte Hover-Logik
  function handleHover(thumbnail) {
    const videoLink = thumbnail.querySelector("a");
    if (!videoLink) return;

    const videoId = getVideoIdFromUrl(videoLink.href);
    if (!videoId) return;

    const isShort = videoLink.href.includes("/shorts/");

    function attachToPlayer(hoverPlayer) {
      if (!hoverPlayer?.src) return false;

      const handler = handleVideoPlayback(hoverPlayer, videoId, true, isShort);
      state.activeHoverHandlers.set(videoId, handler);
      return true;
    }

    const cleanup = () => {
      const handler = state.activeHoverHandlers.get(videoId);
      if (handler) {
        handler.cleanup();
        state.activeHoverHandlers.delete(videoId);
      }
    };

    thumbnail.addEventListener("mouseleave", cleanup, { once: true });

    // Check for hover preview
    const checkInterval = setInterval(() => {
      const player = document.querySelector("ytd-video-preview[active] video");
      if (attachToPlayer(player) || ++checkCount > 5) {
        clearInterval(checkInterval);
      }
    }, CONSTANTS.HOVER_CHECK_INTERVAL);
  }

  // Attach hover listeners
  const observer = new MutationObserver(
    throttle(() => {
      document
        .querySelectorAll(
          "ytd-thumbnail:not([data-watchmarker-hover]), ytd-reel-item-renderer:not([data-watchmarker-hover])"
        )
        .forEach((thumbnail) => {
          thumbnail.dataset.watchmarkerHover = "true";
          thumbnail.addEventListener(
            "mouseover",
            () => handleHover(thumbnail),
            { passive: true }
          );
        });
    }, CONSTANTS.THROTTLE_DELAY)
  );

  observer.observe(document.body, { childList: true, subtree: true });
}

// Message Handling
function setupMessageHandling() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case "SETTINGS_UPDATED":
        loadSettings();
        break;
      case "REFRESH_MARKERS":
      case "IMPORT_SUCCESS":
        removeAllMarkers();
        markWatchedVideos();
        break;
      case "CLEAR_HISTORY":
        removeAllMarkers();
        break;
      case "VIDEO_WATCHED":
        markVideoAsWatched(message.videoId);
        break;
    }
  });
}

// Initialization
function init() {
  loadSettings();
  setupMessageHandling();
  setupHoverTracking();

  // Initial checks
  markWatchedVideos();
  checkForVideoPlayers();

  // Setup intervals
  setInterval(markWatchedVideos, CONSTANTS.PROCESS_INTERVAL);
  setInterval(() => {
    state.processedVideos.clear();
    state.processedHovers.clear();
    state.watchHistoryCache = null;
  }, CONSTANTS.CACHE_UPDATE_INTERVAL);
}

// Start the extension
init();

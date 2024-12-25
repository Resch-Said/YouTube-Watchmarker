let watchHistoryCache = null;
let isProcessing = false;

// Cache-Konstanten
const CACHE_UPDATE_INTERVAL = 30000; // 30 Sekunden
const PROCESS_INTERVAL = 3000; // 3 Sekunden
const THROTTLE_DELAY = 1500; // 1.5 Sekunden
const HOVER_CHECK_INTERVAL = 250; // 250ms

let settings = {
  watchedTime: 30,
  watchedProgress: 50,
  useCustomShortsSettings: true,
  shortsWatchedTime: 15,
  shortsWatchedProgress: 30,
  useCustomHoverSettings: true,
  hoverWatchedTime: 30,
  hoverWatchedProgress: 50,
};

// Lade Einstellungen beim Start und bei Änderungen
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
      settings = {
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

// Initialer Load der Einstellungen
loadSettings();

// Höre auf Settings-Updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SETTINGS_UPDATED") {
    loadSettings();
  }
});

async function getWatchHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get("watchHistory", (data) => {
      watchHistoryCache = data.watchHistory || [];
      resolve(watchHistoryCache);
    });
  });
}

function saveWatchHistory(video) {
  chrome.runtime.sendMessage(
    { type: "SAVE_WATCH_HISTORY", video },
    (response) => {
      if (response.status === "success") {
        console.log("[Watchmarker] Video saved to watch history");
      } else if (response.status === "exists") {
        console.log("[Watchmarker] Video already in watch history");
      }
    }
  );
}

// Optimiertes Video-Tracking
const processedVideos = new Set();
const processedHovers = new Set();

async function markWatchedVideos() {
  if (isProcessing) return;
  isProcessing = true;

  const watchHistory = await getWatchHistory();
  const videoElements = document.querySelectorAll(
    "ytd-thumbnail:not([data-watchmarker-processed]), ytd-rich-item-renderer[is-slim-media]:not([data-watchmarker-processed])"
  );

  for (const videoElement of videoElements) {
    const videoLink = videoElement.querySelector(
      "a[href*='/watch?v='], a[href*='/shorts/']"
    );
    if (!videoLink) continue;

    try {
      const videoId = getVideoIdFromUrl(videoLink.href);
      if (!videoId || processedVideos.has(videoId)) continue;

      processedVideos.add(videoId);
      videoElement.dataset.watchmarkerProcessed = "true";

      const watchedVideo = watchHistory.find((video) => video.id === videoId);
      if (!watchedVideo) continue;

      const isShort = videoLink.href.includes("/shorts/");

      // Bestimme das korrekte Container-Element für die Labels
      const labelContainer = isShort
        ? videoElement.querySelector(
            ".shortsLockupViewModelHostThumbnailContainer"
          )
        : videoElement;

      if (watchedVideo && !labelContainer.querySelector(".watched-label")) {
        labelContainer.classList.add("watched-thumbnail");

        const label = document.createElement("div");
        label.className = "watched-label";
        label.textContent = "Watched";
        label.style.cssText =
          "position:absolute;top:4px;left:4px;background-color:rgba(0,0,0,0.7);color:white;padding:2px 5px;z-index:1000;pointer-events:none;";
        labelContainer.appendChild(label);

        const dateLabel = document.createElement("div");
        dateLabel.textContent = watchedVideo.date;
        dateLabel.style.cssText =
          "position:absolute;top:4px;right:4px;background-color:rgba(0,0,0,0.7);color:white;padding:2px 5px;z-index:1000;pointer-events:none;";
        labelContainer.appendChild(dateLabel);

        console.log(
          "[Watchmarker] Markiere als gesehen:",
          isShort ? "Short" : "Video",
          videoId
        );
      }
    } catch (error) {
      console.error("[Watchmarker] Error processing video:", error);
    }
  }

  isProcessing = false;
}

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

function getVideoType(isHoverPreview, isShort) {
  if (isShort) {
    return isHoverPreview ? "Shorts-Hover" : "Shorts";
  }
  return isHoverPreview ? "Hover" : "Normal";
}

function handleVideoPlayback(
  videoPlayer,
  videoId,
  isHoverPreview = false,
  isShort = false
) {
  if (!videoPlayer || !videoId) return;

  let progressChecked = false;

  const timeUpdateHandler = () => {
    const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    const timeWatched = videoPlayer.currentTime;

    if (!isNaN(progress) && !isNaN(timeWatched)) {
      const videoType = getVideoType(isHoverPreview, isShort);
      const thresholds = getThresholds(isShort, isHoverPreview);
      console.log(
        `[Watchmarker] ${videoType}:`,
        `${timeWatched.toFixed(1)}s/${videoPlayer.duration.toFixed(1)}s`,
        `(${progress.toFixed(1)}%)`,
        `Ziel: ${thresholds.time}s/${thresholds.progress}%`
      );

      const shouldMarkAsWatched = checkWatchThresholds(
        timeWatched,
        videoPlayer.duration,
        isShort,
        isHoverPreview
      );

      if (!progressChecked && shouldMarkAsWatched) {
        progressChecked = true;
        saveWatchHistory({
          id: videoId,
          date: new Date().toLocaleDateString(),
        });

        videoPlayer.removeEventListener("timeupdate", timeUpdateHandler);
      }
    }
  };

  videoPlayer.addEventListener("timeupdate", timeUpdateHandler);

  videoPlayer.addEventListener("ended", () => {
    if (!progressChecked) {
      console.log("[Watchmarker] Video zu Ende geschaut:", videoId);
      saveWatchHistory({
        id: videoId,
        date: new Date().toLocaleDateString(),
      });
    }
  });
}

// Hilfsfunktion um die korrekten Schwellenwerte basierend auf dem Videotyp zu erhalten
function getThresholds(isShorts, isHover) {
  if (isHover) {
    if (!settings.useCustomHoverSettings) {
      return {
        time: settings.watchedTime,
        progress: settings.watchedProgress,
      };
    }
    return {
      time: settings.hoverWatchedTime,
      progress: settings.hoverWatchedProgress,
    };
  }

  if (isShorts) {
    if (!settings.useCustomShortsSettings) {
      return {
        time: settings.watchedTime,
        progress: settings.watchedProgress,
      };
    }
    return {
      time: settings.shortsWatchedTime,
      progress: settings.shortsWatchedProgress,
    };
  }

  return {
    time: settings.watchedTime,
    progress: settings.watchedProgress,
  };
}

// Verwende diese Funktion für die Schwellenwert-Überprüfung
function checkWatchThresholds(currentTime, duration, isShorts, isHover) {
  const thresholds = getThresholds(isShorts, isHover);
  const progress = (currentTime / duration) * 100;

  return currentTime >= thresholds.time || progress >= thresholds.progress;
}

// Verbesserte Video-Erkennung
function checkForVideoPlayers() {
  const videoPlayers = document.querySelectorAll("video");
  videoPlayers.forEach((videoPlayer) => {
    const isShort = window.location.pathname.includes("/shorts/");
    const videoId = isShort
      ? window.location.pathname.split("/shorts/")[1]
      : new URL(window.location.href).searchParams.get("v");

    if (videoId) {
      console.log(
        "[Watchmarker] Video erkannt:",
        isShort ? "Short" : "Normal",
        videoId
      );
      handleVideoPlayback(videoPlayer, videoId, false, isShort);
    }
  });
}

// Optimierte Hover-Erkennung
function checkForHoverPlayback() {
  const thumbnails = document.querySelectorAll(
    "ytd-thumbnail:not([data-watchmarker-hover]), ytd-reel-item-renderer:not([data-watchmarker-hover])"
  );

  thumbnails.forEach((thumbnail) => {
    thumbnail.dataset.watchmarkerHover = "true";

    thumbnail.addEventListener(
      "mouseover",
      () => {
        const videoLink = thumbnail.querySelector("a");
        if (!videoLink) return;

        const videoId = getVideoIdFromUrl(videoLink.href);
        if (!videoId || processedHovers.has(videoId)) return;

        const isShort = videoLink.href.includes("/shorts/");
        let checkCount = 0;
        const checkInterval = setInterval(() => {
          const previewContainer = document.querySelector(
            "ytd-video-preview[active]"
          );
          const hoverPlayer = previewContainer?.querySelector("video");

          if (hoverPlayer) {
            clearInterval(checkInterval);
            processedHovers.add(videoId);
            handleVideoPlayback(hoverPlayer, videoId, true, isShort);
          } else if (++checkCount > 5) {
            // Reduzierte Anzahl der Versuche
            clearInterval(checkInterval);
          }
        }, HOVER_CHECK_INTERVAL);
      },
      { passive: true }
    ); // Optimierung für Event-Listener
  });
}

// Optimierte Observer
const observerOptions = {
  childList: true,
  subtree: true,
  attributes: false, // Ignoriere Attributänderungen
  characterData: false, // Ignoriere Textänderungen
};

// Effizienteres Throttling
function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      func.apply(this, args);
      lastCall = now;
    }
  };
}

const throttledMarkVideos = throttle(markWatchedVideos, THROTTLE_DELAY);
const throttledCheckHover = throttle(checkForHoverPlayback, THROTTLE_DELAY);

// Observer mit optimierten Optionen
const observer = new MutationObserver(throttledMarkVideos);
const hoverObserver = new MutationObserver(throttledCheckHover);

observer.observe(document.body, observerOptions);
hoverObserver.observe(document.body, observerOptions);

// Cache regelmäßig leeren
setInterval(() => {
  processedVideos.clear();
  processedHovers.clear();
  watchHistoryCache = null;
}, CACHE_UPDATE_INTERVAL);

// Optimierte Aktualisierungsintervalle
setInterval(markWatchedVideos, PROCESS_INTERVAL);
setInterval(checkForHoverPlayback, PROCESS_INTERVAL);

// Initialer Check
markWatchedVideos();
checkForVideoPlayers();
checkForHoverPlayback();

// Shorts-spezifische Funktionen
let currentShortsId = null;

function handleShortsNavigation() {
  const shortsPlayer = document.querySelector("video[src]");
  if (!shortsPlayer) return;

  const newShortsId = window.location.pathname.split("/shorts/")[1];
  if (newShortsId && newShortsId !== currentShortsId) {
    currentShortsId = newShortsId;
    console.log("[Watchmarker] Neues Short erkannt:", newShortsId);
    handleVideoPlayback(shortsPlayer, newShortsId, false, true);
  }
}

// URL-Änderungen in Shorts erkennen
function watchShortsNavigation() {
  let lastUrl = location.href;

  // Beobachte URL-Änderungen
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (location.pathname.includes("/shorts/")) {
        handleShortsNavigation();
      }
    }
  });

  // Beobachte Änderungen am Title-Element (YouTube ändert dies bei Shorts-Navigation)
  urlObserver.observe(document.querySelector("title"), {
    subtree: true,
    characterData: true,
    childList: true,
  });

  // Beobachte Shorts-Container für dynamische Updates
  const shortsObserver = new MutationObserver((mutations) => {
    if (location.pathname.includes("/shorts/")) {
      handleShortsNavigation();
    }
  });

  // Beobachte den Shorts-Container
  shortsObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Initialisiere Shorts-Beobachtung
watchShortsNavigation();

// Listener für Import-Aktualisierung
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "REFRESH_MARKERS") {
    // Cache leeren
    processedVideos.clear();
    processedHovers.clear();

    // Alle Markierungen entfernen
    document.querySelectorAll("[data-watchmarker-processed]").forEach((el) => {
      el.removeAttribute("data-watchmarker-processed");
    });

    // Sofortige Neuverarbeitung starten
    processVideos();
    currentShortsId = null; // Reset Shorts tracking
  }
});

let watchHistoryCache = null;
let isProcessing = false;

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

async function markWatchedVideos() {
  if (isProcessing) return;
  isProcessing = true;

  const watchHistory = await getWatchHistory();
  // Spezifischere Selektoren für verschiedene Arten von Thumbnails
  const videoElements = document.querySelectorAll(
    "ytd-thumbnail:not([hidden]), ytd-rich-item-renderer[is-slim-media]"
  );

  for (const videoElement of videoElements) {
    const videoLink = videoElement.querySelector(
      "a[href*='/watch?v='], a[href*='/shorts/']"
    );
    if (!videoLink) continue;

    try {
      const videoId = getVideoIdFromUrl(videoLink.href);
      if (!videoId) continue;

      const watchedVideo = watchHistory.find((video) => video.id === videoId);
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
    await new Promise((resolve) => setTimeout(resolve, 10));
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

  chrome.storage.local.get(
    [
      "watchedTime",
      "watchedProgress",
      "useCustomHoverSettings",
      "hoverWatchedTime",
      "hoverWatchedProgress",
    ],
    (settings) => {
      const useCustomHover = settings.useCustomHoverSettings ?? true;

      // Für Shorts andere Standardwerte verwenden
      const defaultTime = isShort ? 15 : 30;
      const defaultProgress = isShort ? 30 : 50;

      const requiredTime =
        isHoverPreview && useCustomHover
          ? settings.hoverWatchedTime || defaultTime
          : settings.watchedTime || defaultTime;

      const requiredProgress =
        isHoverPreview && useCustomHover
          ? settings.hoverWatchedProgress || defaultProgress
          : settings.watchedProgress || defaultProgress;

      const timeUpdateHandler = () => {
        const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        const timeWatched = videoPlayer.currentTime;

        if (!isNaN(progress) && !isNaN(timeWatched)) {
          const videoType = getVideoType(isHoverPreview, isShort);
          console.log(
            `[Watchmarker] ${videoType}:`,
            `${timeWatched.toFixed(1)}s/${videoPlayer.duration.toFixed(1)}s`,
            `(${progress.toFixed(1)}%)`,
            `Ziel: ${requiredTime}s/${requiredProgress}%`
          );

          const shouldMarkAsWatched =
            timeWatched > requiredTime || progress > requiredProgress;

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
    }
  );

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

// Hover-Playback-Erkennung
function checkForHoverPlayback() {
  const thumbnails = document.querySelectorAll(
    "ytd-thumbnail, ytd-reel-item-renderer"
  );

  thumbnails.forEach((thumbnail) => {
    if (!thumbnail.dataset.watchmarkerHover) {
      thumbnail.dataset.watchmarkerHover = "true";

      thumbnail.addEventListener("mouseover", () => {
        const videoLink = thumbnail.querySelector("a");
        if (!videoLink) return;

        const videoId = getVideoIdFromUrl(videoLink.href);
        if (!videoId) return;

        const isShort = videoLink.href.includes("/shorts/");
        console.log(
          "[Watchmarker] Hover erkannt:",
          isShort ? "Shorts" : "Video",
          videoId
        );

        let checkCount = 0;
        const checkInterval = setInterval(() => {
          const previewContainer = document.querySelector(
            "ytd-video-preview[active]"
          );
          const hoverPlayer = previewContainer?.querySelector("video");

          if (hoverPlayer) {
            clearInterval(checkInterval);
            // Übergebe isShort an handleVideoPlayback
            handleVideoPlayback(hoverPlayer, videoId, true, isShort);
          } else if (++checkCount > 10) {
            clearInterval(checkInterval);
          }
        }, 200);
      });
    }
  });
}

// Observer für Hover-Playback mit Throttling
let throttleTimeout = null;
const hoverObserver = new MutationObserver(() => {
  if (!throttleTimeout) {
    throttleTimeout = setTimeout(() => {
      checkForHoverPlayback();
      throttleTimeout = null;
    }, 1000);
  }
});

// Observer für Video-Player
const videoObserver = new MutationObserver(checkForVideoPlayers);
videoObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

// Observer für Hover-Playback
hoverObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

// MutationObserver für Videomarkierungen
const observer = new MutationObserver(() => {
  markWatchedVideos();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Initialer Check
markWatchedVideos();
checkForVideoPlayers();
checkForHoverPlayback();

// Regelmäßige Aktualisierung
setInterval(markWatchedVideos, 2000);

// Regelmäßige Aktualisierung der Hover-Erkennung
setInterval(checkForHoverPlayback, 2000);

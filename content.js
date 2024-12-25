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
  const videoElements = document.querySelectorAll("ytd-thumbnail");

  for (const videoElement of videoElements) {
    const videoLink = videoElement.querySelector("a");
    if (videoLink?.href.includes("watch?v=")) {
      try {
        const videoId = new URL(videoLink.href).searchParams.get("v");
        const watchedVideo = watchHistory.find((video) => video.id === videoId);

        if (watchedVideo && !videoElement.querySelector(".watched-label")) {
          videoElement.classList.add("watched-thumbnail");

          const label = document.createElement("div");
          label.className = "watched-label";
          label.textContent = "Watched";
          label.style.cssText =
            "position:absolute;top:0;left:0;background-color:rgba(0,0,0,0.7);color:white;padding:2px 5px;z-index:1000;";
          videoElement.appendChild(label);

          const dateLabel = document.createElement("div");
          dateLabel.textContent = watchedVideo.date;
          dateLabel.style.cssText =
            "position:absolute;top:0;right:0;background-color:rgba(0,0,0,0.7);color:white;padding:2px 5px;z-index:1000;";
          videoElement.appendChild(dateLabel);
        }
      } catch (error) {
        console.error("[Watchmarker] Error processing video:", error);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 10)); // Kurze 10ms Pause
  }

  isProcessing = false;
}

function handleVideoPlayback(videoPlayer, videoId, isHoverPreview = false) {
  if (!videoPlayer || !videoId) return;

  let progressChecked = false;

  const timeUpdateHandler = () => {
    const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    const timeWatched = videoPlayer.currentTime;

    if (!isNaN(progress) && !isNaN(timeWatched)) {
      console.log(
        `[Watchmarker] Video-Fortschritt für ${videoId}:`,
        `Zeit: ${timeWatched.toFixed(1)}s,`,
        `Dauer: ${videoPlayer.duration.toFixed(1)}s,`,
        `Fortschritt: ${progress.toFixed(1)}%`
      );

      // Gleiche Bedingungen für alle Videos
      const shouldMarkAsWatched = timeWatched > 30 || progress > 50;

      if (!progressChecked && shouldMarkAsWatched) {
        progressChecked = true;
        console.log(
          "[Watchmarker] Video als gesehen markiert:",
          videoId,
          isHoverPreview ? "(Hover-Preview)" : "(Normal)"
        );
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

// Verbesserte Video-Erkennung
function checkForVideoPlayers() {
  const videoPlayers = document.querySelectorAll("video");
  videoPlayers.forEach((videoPlayer) => {
    const videoId = new URL(window.location.href).searchParams.get("v");
    handleVideoPlayback(videoPlayer, videoId);
  });
}

// Hover-Playback-Erkennung
function checkForHoverPlayback() {
  const thumbnails = document.querySelectorAll("ytd-thumbnail");
  console.log("[Watchmarker] Gefundene Thumbnails:", thumbnails.length);

  thumbnails.forEach((thumbnail) => {
    if (!thumbnail.dataset.watchmarkerHover) {
      thumbnail.dataset.watchmarkerHover = "true";

      thumbnail.addEventListener("mouseover", () => {
        const videoLink = thumbnail.querySelector("a");
        if (!videoLink?.href.includes("watch?v=")) return;

        const videoId = new URL(videoLink.href).searchParams.get("v");
        console.log("[Watchmarker] Hover auf Thumbnail erkannt:", videoId);

        let checkCount = 0;
        const checkInterval = setInterval(() => {
          const previewContainer = document.querySelector(
            "ytd-video-preview[active]"
          );
          const hoverPlayer = previewContainer?.querySelector("video");

          if (hoverPlayer) {
            console.log("[Watchmarker] Hover-Video gefunden für ID:", videoId);
            clearInterval(checkInterval);
            handleVideoPlayback(hoverPlayer, videoId, true);
          } else {
            console.log("[Watchmarker] Suche nach Hover-Video...", checkCount);
            checkCount++;
            if (checkCount > 10) clearInterval(checkInterval);
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

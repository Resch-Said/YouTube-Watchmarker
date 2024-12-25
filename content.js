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
          videoElement.style.filter = "grayscale(100%)";

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

function handleVideoPlayback() {
  const videoPlayer = document.querySelector("video");
  if (videoPlayer && !videoPlayer.dataset.watchmarkerInitialized) {
    videoPlayer.dataset.watchmarkerInitialized = "true";
    
    // Video als gesehen markieren nach 30 Sekunden oder 50% Fortschritt
    let progressChecked = false;
    
    videoPlayer.addEventListener("timeupdate", () => {
      if (!progressChecked) {
        const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        const timeWatched = videoPlayer.currentTime;
        
        if (timeWatched > 30 || progress > 50) {
          progressChecked = true;
          const videoId = new URL(window.location.href).searchParams.get("v");
          if (videoId) {
            console.log("[Watchmarker] Video als gesehen markiert:", videoId);
            saveWatchHistory({
              id: videoId,
              date: new Date().toLocaleDateString(),
            });
          }
        }
      }
    });

    // Zusätzlich noch das Ende überwachen
    videoPlayer.addEventListener("ended", () => {
      const videoId = new URL(window.location.href).searchParams.get("v");
      if (videoId) {
        console.log("[Watchmarker] Video zu Ende geschaut:", videoId);
        saveWatchHistory({
          id: videoId,
          date: new Date().toLocaleDateString(),
        });
      }
    });
  }
}

// Verbesserte Video-Erkennung
function checkForVideoPlayer() {
  handleVideoPlayback();
}

// Observer für Video-Player
const videoObserver = new MutationObserver(checkForVideoPlayer);
videoObserver.observe(document.body, {
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
handleVideoPlayback();

// Regelmäßige Aktualisierung
setInterval(markWatchedVideos, 2000);

function logWatchedVideos() {
  chrome.storage.local.get("watchHistory", (data) => {
    const watchHistory = data.watchHistory || [];
    console.log("[Watchmarker] Gesehene Videos:", watchHistory);
  });
}

function markWatchedVideos() {
  chrome.storage.local.get("watchHistory", (data) => {
    const watchHistory = data.watchHistory || [];
    const videoElements = document.querySelectorAll("ytd-thumbnail");

    videoElements.forEach((videoElement) => {
      const videoLink = videoElement.querySelector("a");
      if (videoLink && videoLink.href.includes("watch?v=")) {
        const videoId = new URL(videoLink.href).searchParams.get("v");
        const watchedVideo = watchHistory.find((video) => video.id === videoId);

        if (watchedVideo) {
          videoElement.style.filter = "grayscale(100%)";
          const label = document.createElement("div");
          label.textContent = "Watched";
          label.style.position = "absolute";
          label.style.top = "0";
          label.style.left = "0";
          label.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
          label.style.color = "white";
          label.style.padding = "2px 5px";
          videoElement.appendChild(label);

          const dateLabel = document.createElement("div");
          dateLabel.textContent = watchedVideo.date;
          dateLabel.style.position = "absolute";
          dateLabel.style.top = "0";
          dateLabel.style.right = "0";
          dateLabel.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
          dateLabel.style.color = "white";
          dateLabel.style.padding = "2px 5px";
          videoElement.appendChild(dateLabel);
        }
      }
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

function checkAndMarkVideos() {
  const videoElements = document.querySelectorAll("ytd-thumbnail");

  videoElements.forEach((videoElement) => {
    const videoLink = videoElement.querySelector("a");
    if (videoLink && videoLink.href.includes("watch?v=")) {
      const videoId = new URL(videoLink.href).searchParams.get("v");
      const watched = videoElement.querySelector(".watched-label");

      if (!watched && videoId) {
        const video = {
          id: videoId,
          date: new Date().toLocaleDateString(),
        };
        saveWatchHistory(video);
      }
    }
  });

  markWatchedVideos();
  logWatchedVideos();
}

setInterval(checkAndMarkVideos, 5000);

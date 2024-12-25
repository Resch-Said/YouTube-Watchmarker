document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  try {
    const contentContainer = await waitForElement(
      "#content, ytd-rich-grid-renderer"
    );
    if (!contentContainer) {
      throw new Error("Content container not found");
    }

    observeContentContainer(contentContainer);
    setupVideoProgressTracking();
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

function observeContentContainer(container) {
  const observer = new MutationObserver((mutations) => {
    const addedNodes = mutations
      .flatMap((mutation) => Array.from(mutation.addedNodes))
      .filter((node) => node.nodeType === 1);

    if (addedNodes.length) {
      markWatchedVideos(addedNodes);
    }
  });

  observer.observe(container, { childList: true, subtree: true });
  markWatchedVideos([container]);
}

function setupVideoProgressTracking() {
  if (window.location.pathname === "/watch") {
    const video = document.querySelector("video");
    if (video) {
      let progressChecked = false;

      video.addEventListener("timeupdate", () => {
        if (!progressChecked && video.currentTime / video.duration >= 0.3) {
          progressChecked = true;
          const videoId = new URLSearchParams(window.location.search).get("v");
          if (videoId) {
            chrome.runtime.sendMessage({ type: "VIDEO_WATCHED", videoId });
          }
        }
      });
    }
  }
}

async function markWatchedVideos(containers) {
  try {
    const result = await chrome.storage.local.get(["watchedVideos"]);
    const watchedVideos = result.watchedVideos || {};

    containers.forEach((container) => {
      const thumbnails = container.querySelectorAll("ytd-thumbnail");
      thumbnails.forEach((thumbnail) => {
        const videoId = getVideoId(thumbnail);
        if (videoId && watchedVideos[videoId]) {
          markThumbnail(thumbnail, watchedVideos[videoId].timestamp);
        }
      });
    });
  } catch (error) {
    console.error("Error marking watched videos:", error);
  }
}

function getVideoId(thumbnail) {
  const link = thumbnail.querySelector("a#thumbnail.yt-simple-endpoint");
  if (!link) return null;

  try {
    return new URL(link.href).searchParams.get("v");
  } catch (error) {
    console.error("Error extracting video ID:", error);
    return null;
  }
}

function markThumbnail(thumbnail, timestamp) {
  if (thumbnail.querySelector(".watched-label")) return;

  const thumbnailAnchor = thumbnail.querySelector("a#thumbnail");
  if (!thumbnailAnchor) return;

  const watchedLabel = document.createElement("div");
  watchedLabel.className = "watched-label";
  watchedLabel.textContent = "WATCHED";

  const timeLabel = document.createElement("div");
  timeLabel.className = "watched-time";
  timeLabel.textContent = new Date(timestamp).toLocaleDateString();

  thumbnailAnchor.appendChild(watchedLabel);
  thumbnailAnchor.appendChild(timeLabel);
  thumbnailAnchor.classList.add("watched-thumbnail");
}

// Logger-Funktion mit einheitlichem Prefix
const Logger = {
  prefix: "[Watchmarker]",
  formatMessage: (type, ...args) => [`${Logger.prefix} [${type}]`, ...args],
  debug: (...args) =>
    console.debug(...Logger.formatMessage("Popup/Debug", ...args)),
  log: (...args) => console.log(...Logger.formatMessage("Popup/Info", ...args)),
  warn: (...args) =>
    console.warn(...Logger.formatMessage("Popup/Warn", ...args)),
  error: (...args) =>
    console.error(...Logger.formatMessage("Popup/Error", ...args)),
};

function showStatus(message, isError = false) {
  const status = document.getElementById("status");
  status.style.display = "block";
  status.style.backgroundColor = isError ? "#ffebee" : "#e8f5e9";
  status.textContent = message;
}

// Storage Helper Funktionen
async function getWatchedVideos() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["watchedVideos"], function (result) {
      Logger.log("Geladene Videos aus Storage:", result.watchedVideos);
      resolve(result.watchedVideos || {});
    });
  });
}

async function addWatchedVideo(videoId) {
  const watchedVideos = await getWatchedVideos();
  if (!watchedVideos[videoId]) {
    watchedVideos[videoId] = {
      timestamp: new Date().toISOString(),
      watched: true,
    };
    return new Promise((resolve) => {
      chrome.storage.local.set({ watchedVideos }, function () {
        Logger.log("Video gespeichert:", videoId);
        Logger.log("Aktuelle Liste:", watchedVideos);
        resolve(true);
      });
    });
  }
  return false;
}

// Storage Helper erweitern
async function clearWatchHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ watchedVideos: {} }, () => {
      Logger.log("Watch-History gelöscht");
      resolve(true);
    });
  });
}

document.getElementById("markVideo").addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab.url.includes("youtube.com/watch")) {
      showStatus("Bitte öffne ein YouTube-Video!", true);
      return;
    }

    const videoId = new URL(tab.url).searchParams.get("v");
    Logger.log("Versuche Video zu markieren:", videoId);

    const wasAdded = await addWatchedVideo(videoId);
    if (wasAdded) {
      chrome.tabs.sendMessage(
        tab.id,
        {
          action: "markVideo",
          videoId: videoId,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            Logger.error("Fehler:", chrome.runtime.lastError);
            showStatus("Fehler beim Markieren!", true);
          } else {
            showStatus("Video wurde als gesehen markiert!");
          }
        }
      );
    } else {
      showStatus("Video wurde bereits markiert!");
    }
  } catch (error) {
    Logger.error("Fehler beim Markieren:", error);
    showStatus("Ein Fehler ist aufgetreten!", true);
  }
});

// Statistik-Funktionalität
document.getElementById("showStats").addEventListener("click", async () => {
  try {
    const videos = await getWatchedVideos();
    const totalVideos = Object.keys(videos).length;
    let lastActivity = "Keine";

    if (totalVideos > 0) {
      const timestamps = Object.values(videos).map(
        (v) => new Date(v.timestamp)
      );
      lastActivity = new Date(Math.max(...timestamps)).toLocaleString();
    }

    const statsMessage = `Gesehene Videos: ${totalVideos}\nLetzte Aktivität: ${lastActivity}`;
    showStatus(statsMessage);
  } catch (error) {
    Logger.error("Fehler beim Laden der Statistiken:", error);
    showStatus("Fehler beim Laden der Statistiken!", true);
  }
});

// Initialisiere Storage beim ersten Start
document.addEventListener("DOMContentLoaded", async () => {
  const videos = await getWatchedVideos();
  Logger.log("Aktuelle gespeicherte Videos:", videos);
});

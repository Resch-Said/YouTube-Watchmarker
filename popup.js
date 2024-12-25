// Lade gespeicherte Einstellungen
chrome.storage.local.get(["watchedTime", "watchedProgress"], (data) => {
  document.getElementById("watchedTime").value = data.watchedTime || 30;
  document.getElementById("watchedProgress").value = data.watchedProgress || 50;
});

// Speichere Einstellungen
document.getElementById("saveSettings").addEventListener("click", () => {
  const watchedTime = parseInt(document.getElementById("watchedTime").value);
  const watchedProgress = parseInt(
    document.getElementById("watchedProgress").value
  );

  chrome.storage.local.set(
    {
      watchedTime,
      watchedProgress,
    },
    () => {
      alert("Einstellungen gespeichert!");
    }
  );
});

// Watch-History leeren
document.getElementById("clearWatchHistory").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "CLEAR_WATCH_HISTORY" }, (response) => {
    if (response.status === "cleared") {
      alert("Watch-History wurde geleert.");
    }
  });
});

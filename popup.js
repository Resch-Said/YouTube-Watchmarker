// Lade gespeicherte Einstellungen
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
    // Normale Videos
    document.getElementById("watchedTime").value = data.watchedTime || 30;
    document.getElementById("watchedProgress").value =
      data.watchedProgress || 50;

    // Shorts
    document.getElementById("useCustomShortsSettings").checked =
      data.useCustomShortsSettings ?? true;
    document.getElementById("shortsWatchedTime").value =
      data.shortsWatchedTime || 15;
    document.getElementById("shortsWatchedProgress").value =
      data.shortsWatchedProgress || 30;

    // Hover
    document.getElementById("useCustomHoverSettings").checked =
      data.useCustomHoverSettings ?? true;
    document.getElementById("hoverWatchedTime").value =
      data.hoverWatchedTime || 30;
    document.getElementById("hoverWatchedProgress").value =
      data.hoverWatchedProgress || 50;

    updateSettingsVisibility();
  }
);

// Toggle Settings Visibility
document
  .getElementById("useCustomShortsSettings")
  .addEventListener("change", updateSettingsVisibility);
document
  .getElementById("useCustomHoverSettings")
  .addEventListener("change", updateSettingsVisibility);

function updateSettingsVisibility() {
  const shortsCustom = document.getElementById(
    "useCustomShortsSettings"
  ).checked;
  const hoverCustom = document.getElementById("useCustomHoverSettings").checked;

  document.getElementById("shortsSettings").style.display = shortsCustom
    ? "block"
    : "none";
  document.getElementById("hoverSettings").style.display = hoverCustom
    ? "block"
    : "none";
}

// Speichere Einstellungen
document.getElementById("saveSettings").addEventListener("click", () => {
  const settings = {
    // Normale Videos
    watchedTime: parseInt(document.getElementById("watchedTime").value),
    watchedProgress: parseInt(document.getElementById("watchedProgress").value),

    // Shorts
    useCustomShortsSettings: document.getElementById("useCustomShortsSettings")
      .checked,
    shortsWatchedTime: parseInt(
      document.getElementById("shortsWatchedTime").value
    ),
    shortsWatchedProgress: parseInt(
      document.getElementById("shortsWatchedProgress").value
    ),

    // Hover
    useCustomHoverSettings: document.getElementById("useCustomHoverSettings")
      .checked,
    hoverWatchedTime: parseInt(
      document.getElementById("hoverWatchedTime").value
    ),
    hoverWatchedProgress: parseInt(
      document.getElementById("hoverWatchedProgress").value
    ),
  };

  chrome.storage.local.set(settings, () => {
    alert("Einstellungen gespeichert!");
  });
});

// Watch-History leeren
document.getElementById("clearWatchHistory").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "CLEAR_WATCH_HISTORY" }, (response) => {
    if (response.status === "cleared") {
      alert("Watch-History wurde geleert.");
    }
  });
});

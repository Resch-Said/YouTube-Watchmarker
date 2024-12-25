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
  const watchedTime = parseInt(document.getElementById("watchedTime").value);
  const watchedProgress = parseInt(
    document.getElementById("watchedProgress").value
  );
  const useCustomShortsSettings = document.getElementById(
    "useCustomShortsSettings"
  ).checked;
  const useCustomHoverSettings = document.getElementById(
    "useCustomHoverSettings"
  ).checked;

  const settings = {
    // Normale Videos
    watchedTime: watchedTime,
    watchedProgress: watchedProgress,

    // Shorts
    useCustomShortsSettings: useCustomShortsSettings,
    shortsWatchedTime: useCustomShortsSettings
      ? parseInt(document.getElementById("shortsWatchedTime").value)
      : watchedTime,
    shortsWatchedProgress: useCustomShortsSettings
      ? parseInt(document.getElementById("shortsWatchedProgress").value)
      : watchedProgress,

    // Hover
    useCustomHoverSettings: useCustomHoverSettings,
    hoverWatchedTime: useCustomHoverSettings
      ? parseInt(document.getElementById("hoverWatchedTime").value)
      : watchedTime,
    hoverWatchedProgress: useCustomHoverSettings
      ? parseInt(document.getElementById("hoverWatchedProgress").value)
      : watchedProgress,
  };

  chrome.storage.local.set(settings, () => {
    // Benachrichtige alle aktiven YouTube-Tabs über die Änderung
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { type: "SETTINGS_UPDATED" });
      });
    });
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

// Export Funktionalität
document.getElementById("exportData").addEventListener("click", async () => {
  const data = await chrome.storage.local.get(null);
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "youtube-watchmarker-backup.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import Funktionalität
document.getElementById("importData").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        await chrome.storage.local.clear();
        await chrome.storage.local.set(data);

        // Update UI with imported settings
        if (data.watchedTime)
          document.getElementById("watchedTime").value = data.watchedTime;
        if (data.watchedProgress)
          document.getElementById("watchedProgress").value =
            data.watchedProgress;

        // Update Shorts settings
        if ("useCustomShortsSettings" in data) {
          document.getElementById("useCustomShortsSettings").checked =
            data.useCustomShortsSettings;
          if (data.shortsWatchedTime)
            document.getElementById("shortsWatchedTime").value =
              data.shortsWatchedTime;
          if (data.shortsWatchedProgress)
            document.getElementById("shortsWatchedProgress").value =
              data.shortsWatchedProgress;
        }

        // Update Hover settings
        if ("useCustomHoverSettings" in data) {
          document.getElementById("useCustomHoverSettings").checked =
            data.useCustomHoverSettings;
          if (data.hoverWatchedTime)
            document.getElementById("hoverWatchedTime").value =
              data.hoverWatchedTime;
          if (data.hoverWatchedProgress)
            document.getElementById("hoverWatchedProgress").value =
              data.hoverWatchedProgress;
        }

        // Update visibility
        updateSettingsVisibility();

        // Benachrichtige alle aktiven YouTube-Tabs
        const tabs = await chrome.tabs.query({ url: "*://*.youtube.com/*" });
        for (const tab of tabs) {
          chrome.tabs.sendMessage(tab.id, { type: "REFRESH_MARKERS" });
        }

        alert("Daten erfolgreich importiert!");
      } catch (error) {
        alert("Fehler beim Importieren der Daten: " + error.message);
      }
    };
    reader.readAsText(file);
  }
});

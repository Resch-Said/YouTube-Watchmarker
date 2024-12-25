// Lade gespeicherte Einstellungen
chrome.storage.local.get([
  'watchedTime',
  'watchedProgress',
  'useCustomHoverSettings',
  'hoverWatchedTime',
  'hoverWatchedProgress'
], (data) => {
  document.getElementById('watchedTime').value = data.watchedTime || 30;
  document.getElementById('watchedProgress').value = data.watchedProgress || 50;
  document.getElementById('useCustomHoverSettings').checked = data.useCustomHoverSettings ?? true;
  document.getElementById('hoverWatchedTime').value = data.hoverWatchedTime || 30;
  document.getElementById('hoverWatchedProgress').value = data.hoverWatchedProgress || 50;
  
  updateHoverSettingsVisibility();
});

// Toggle Hover-Einstellungen
document.getElementById('useCustomHoverSettings').addEventListener('change', updateHoverSettingsVisibility);

function updateHoverSettingsVisibility() {
  const useCustom = document.getElementById('useCustomHoverSettings').checked;
  document.getElementById('hoverSettings').style.display = useCustom ? 'block' : 'none';
}

// Speichere Einstellungen
document.getElementById('saveSettings').addEventListener('click', () => {
  const watchedTime = parseInt(document.getElementById('watchedTime').value);
  const watchedProgress = parseInt(document.getElementById('watchedProgress').value);
  const useCustomHoverSettings = document.getElementById('useCustomHoverSettings').checked;
  const hoverWatchedTime = parseInt(document.getElementById('hoverWatchedTime').value);
  const hoverWatchedProgress = parseInt(document.getElementById('hoverWatchedProgress').value);

  chrome.storage.local.set({
    watchedTime,
    watchedProgress,
    useCustomHoverSettings,
    hoverWatchedTime,
    hoverWatchedProgress
  }, () => {
    alert('Einstellungen gespeichert!');
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

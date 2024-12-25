document.getElementById('clearWatchHistory').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'CLEAR_WATCH_HISTORY' }, (response) => {
    if (response.status === 'cleared') {
      alert('Watch-History wurde geleert.');
    }
  });
});

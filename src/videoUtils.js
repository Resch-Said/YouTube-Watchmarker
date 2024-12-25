export function getVideoIdFromUrl(url) {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get('v');
}

export function handleVideoPlayback(videoPlayer, videoId) {
  const state = {
    accumulatedTime: 0,
    progressChecked: false
  };

  const updateProgress = () => {
    state.accumulatedTime += 1;
    if (videoPlayer.currentTime > videoPlayer.duration * 0.5) {
      state.progressChecked = true;
    }
  };

  videoPlayer.addEventListener('timeupdate', updateProgress);
  videoPlayer.addEventListener('ended', () => {
    state.progressChecked = true;
  });

  return { state };
}

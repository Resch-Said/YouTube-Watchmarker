export function getVideoIdFromUrl(url) {
  try {
    // Handle shorts URLs
    if (url.includes('/shorts/')) {
      return url.split('/shorts/')[1].split('?')[0];
    }
    
    // Handle standard watch URLs
    if (url.includes('/watch')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      return urlParams.get('v');
    }
    
    // Handle youtu.be URLs
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    }
    
    // Handle embed URLs
    if (url.includes('/embed/')) {
      return url.split('/embed/')[1].split('?')[0];
    }

    return null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
}

export const VIDEO_TYPES = {
  STANDARD: 'standard',
  SHORTS: 'shorts'
};

export const WATCH_THRESHOLDS = {
  standard: {  // Geändert von STANDARD zu standard
    time: 30,
    percent: 50
  },
  shorts: {    // Geändert von SHORTS zu shorts
    time: 15,
    percent: 30
  }
};

export function handleVideoPlayback(videoPlayer, videoId, videoType = 'standard') {
  const state = {
    startTime: Date.now(),
    accumulatedTime: 0,
    lastUpdate: Date.now(),
    progressChecked: false,
    watchThresholds: WATCH_THRESHOLDS[videoType]
  };

  const updateProgress = () => {
    const now = Date.now();
    const timeDiff = (now - state.lastUpdate) / 1000;
    
    // Simuliere Zeitaktualisierung für Tests
    if (videoPlayer.currentTime > 0) {
      state.accumulatedTime = videoPlayer.currentTime;
    }
    
    state.lastUpdate = now;

    // Prüfe Schwellenwerte
    const timeThresholdMet = state.accumulatedTime >= state.watchThresholds.time;
    const percentThresholdMet = videoPlayer.currentTime >= (videoPlayer.duration * state.watchThresholds.percent / 100);

    if (timeThresholdMet || percentThresholdMet) {
      state.progressChecked = true;
    }
  };

  videoPlayer.addEventListener('timeupdate', updateProgress);
  videoPlayer.addEventListener('ended', () => {
    state.progressChecked = true;
  });

  return { 
    state,
    getWatchProgress: () => ({
      videoId,
      type: videoType,
      accumulatedTime: state.accumulatedTime,
      watchedAt: state.startTime,
      completed: state.progressChecked
    })
  };
}

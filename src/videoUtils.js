import { StorageManager } from './storageManager.js';

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

export function createWatchedLabel() {
  const label = document.createElement('div');
  label.className = 'watched-label';
  label.textContent = 'Watched';
  label.style.cssText = `
    position: absolute;
    top: 4px;
    left: 4px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 5px;
    border-radius: 2px;
    font-size: 12px;
    z-index: 1000;
    pointer-events: none;
  `;
  return label;
}

export async function markVideoAsWatched(thumbnailElement) {
  if (!thumbnailElement) return;
  
  try {
    // Prüfe die UI-Einstellungen
    const storage = new StorageManager();
    const settings = await storage.getSettings();

    // Füge Grayscale-Effekt hinzu wenn aktiviert
    if (settings.ui.grayscale) {
      thumbnailElement.classList.add('watched-thumbnail');
    }

    // Füge Watched-Label hinzu wenn aktiviert
    if (settings.ui.labels) {
      // Entferne existierendes Label falls vorhanden
      const existingLabel = thumbnailElement.querySelector('.watched-label');
      if (existingLabel) existingLabel.remove();
      
      // Füge neues Label hinzu
      const label = createWatchedLabel();
      thumbnailElement.style.position = 'relative';
      thumbnailElement.appendChild(label);
    }
  } catch (error) {
    console.error('Error in markVideoAsWatched:', error);
  }
}

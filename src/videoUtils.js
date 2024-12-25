// Entferne den Import
// Entferne alle export statements

const VIDEO_TYPES = {
  STANDARD: 'standard',
  SHORTS: 'shorts'
};

const WATCH_THRESHOLDS = {
  standard: {
    time: 30,
    percent: 50
  },
  shorts: {
    time: 15,
    percent: 30
  }
};

function getVideoIdFromUrl(url) {
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

function handleVideoPlayback(videoPlayer, videoId, videoType = 'standard') {
  console.debug(`[Watchmarker] Starte Video-Tracking für ${videoId} (Typ: ${videoType})`);
  
  const state = {
    startTime: Date.now(),
    accumulatedTime: 0,
    lastUpdate: Date.now(),
    progressChecked: false,
    watchThresholds: WATCH_THRESHOLDS[videoType],
    lastTimeUpdate: 0
  };

  console.debug(`[Watchmarker] Schwellenwerte für ${videoType}:`, state.watchThresholds);

  const updateProgress = () => {
    const now = Date.now();
    const timeDiff = (now - state.lastUpdate) / 1000;  // Zeit seit letztem Update in Sekunden
    
    if (videoPlayer.currentTime > 0 && !videoPlayer.paused) {
      // Nur Zeit hinzufügen wenn Video läuft
      state.accumulatedTime += timeDiff;
    }
    
    state.lastUpdate = now;
    state.lastTimeUpdate = videoPlayer.currentTime;

    // Debug-Logs für Progress-Updates
    console.debug(`[Watchmarker] Progress Update für ${videoId}:`, {
      currentTime: videoPlayer.currentTime,
      duration: videoPlayer.duration,
      accumulatedTime: state.accumulatedTime,
      timeThreshold: state.watchThresholds.time,
      percentThreshold: state.watchThresholds.percent
    });

    // Schwellenwert-Prüfung
    const timeThresholdMet = state.accumulatedTime >= state.watchThresholds.time;
    const percentThresholdMet = videoPlayer.duration && 
      (videoPlayer.currentTime >= (videoPlayer.duration * state.watchThresholds.percent / 100));

    if (timeThresholdMet || percentThresholdMet) {
      if (!state.progressChecked) {
        console.log(`[Watchmarker] Video ${videoId} hat Schwellenwert erreicht:`, {
          timeThresholdMet,
          percentThresholdMet,
          currentTime: videoPlayer.currentTime,
          duration: videoPlayer.duration
        });
      }
      state.progressChecked = true;
    }
  };

  // Event-Listener für Debugging
  videoPlayer.addEventListener('play', () => {
    console.debug(`[Watchmarker] Video ${videoId} gestartet`);
  });

  videoPlayer.addEventListener('pause', () => {
    console.debug(`[Watchmarker] Video ${videoId} pausiert bei ${videoPlayer.currentTime}s`);
  });

  videoPlayer.addEventListener('timeupdate', updateProgress);
  
  videoPlayer.addEventListener('ended', () => {
    console.log(`[Watchmarker] Video ${videoId} beendet`);
    state.progressChecked = true;
  });

  return { 
    state,
    getWatchProgress: () => {
      const progress = {
        videoId,
        type: videoType,
        accumulatedTime: state.accumulatedTime,
        watchedAt: state.startTime,
        completed: state.progressChecked
      };
      console.debug(`[Watchmarker] Aktueller Fortschritt für ${videoId}:`, progress);
      return progress;
    }
  };
}

function createWatchedLabel() {
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

function createDateLabel(date) {
  const label = document.createElement('div');
  label.className = 'date-label';
  
  // Formatiere das Datum mit führenden Nullen
  const dateObj = new Date(date);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  label.textContent = `${day}.${month}.${year}`;
  label.style.cssText = `
    position: absolute;
    top: 4px;
    right: 4px;
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

async function markVideoAsWatched(thumbnailElement, watchDate = Date.now()) {
  if (!thumbnailElement) {
    console.log('[Watchmarker] Kein Thumbnail-Element zum Markieren gefunden');
    return;
  }
  
  try {
    const storage = new StorageManager();
    const settings = await storage.getSettings();
    console.log('[Watchmarker] Markiere Thumbnail mit Einstellungen:', settings);

    // Position für Labels sicherstellen
    thumbnailElement.style.position = 'relative';

    // Grayscale-Effekt
    if (settings.ui.grayscale) {
      thumbnailElement.classList.add('watched-thumbnail');
      console.log('[Watchmarker] Grayscale-Effekt angewendet');
    }

    // Labels
    if (settings.ui.labels) {
      // Existierende Labels entfernen
      const existingWatchedLabel = thumbnailElement.querySelector('.watched-label');
      const existingDateLabel = thumbnailElement.querySelector('.date-label');
      if (existingWatchedLabel) existingWatchedLabel.remove();
      if (existingDateLabel) existingDateLabel.remove();
      
      // Neue Labels hinzufügen
      const watchedLabel = createWatchedLabel();
      const dateLabel = createDateLabel(watchDate);
      thumbnailElement.appendChild(watchedLabel);
      thumbnailElement.appendChild(dateLabel);
      console.log('[Watchmarker] Labels hinzugefügt');
    }

  } catch (error) {
    console.error('[Watchmarker] Fehler beim Markieren:', error);
  }
}

export {
  VIDEO_TYPES,
  WATCH_THRESHOLDS,
  getVideoIdFromUrl,
  handleVideoPlayback,
  createWatchedLabel, 
  createDateLabel,
  markVideoAsWatched
};

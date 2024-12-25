
function applyGrayscaleEffect(videoId) {
  // Finde alle Thumbnails für das Video
  const thumbnails = document.querySelectorAll(`ytd-thumbnail[video-id="${videoId}"]`);
  
  thumbnails.forEach(thumbnail => {
    thumbnail.classList.add('watched-thumbnail');
  });
}

// Füge dies zur existierenden handleVideoPlayback Funktion hinzu
if (state.progressChecked) {
  applyGrayscaleEffect(videoId);
}
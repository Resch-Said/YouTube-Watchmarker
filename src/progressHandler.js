export const PROGRESS_STATES = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

export class ProgressHandler {
  constructor() {
    this.progressMap = new Map();
  }

  updateProgress(videoId, progress) {
    const currentProgress = this.progressMap.get(videoId) || {
      state: PROGRESS_STATES.NOT_STARTED,
      watchCount: 0,
      lastWatched: null,
      accumulatedTime: 0,
    };

    if (progress.completed) {
      // Immer den watchCount erhöhen wenn completed true ist
      currentProgress.watchCount++;
      currentProgress.state = PROGRESS_STATES.COMPLETED;
      currentProgress.lastWatched = Date.now();
    } else if (progress.accumulatedTime > 0) {
      currentProgress.state = PROGRESS_STATES.IN_PROGRESS;
      currentProgress.accumulatedTime = Math.max(
        currentProgress.accumulatedTime,
        progress.accumulatedTime
      );
    }

    this.progressMap.set(videoId, currentProgress);
    return currentProgress;
  }

  getProgress(videoId) {
    return (
      this.progressMap.get(videoId) || {
        state: PROGRESS_STATES.NOT_STARTED,
        watchCount: 0,
        lastWatched: null,
        accumulatedTime: 0,
      }
    );
  }

  isCompleted(videoId) {
    const progress = this.getProgress(videoId);
    return progress.state === PROGRESS_STATES.COMPLETED;
  }

  resetProgress(videoId) {
    this.progressMap.delete(videoId);
  }
}

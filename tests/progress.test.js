import { ProgressHandler, PROGRESS_STATES } from "../src/progressHandler.js";
import { jest } from '@jest/globals';

const TEST_VIDEO_ID = "_CY69RkXYlw";

describe("Progress Handler", () => {
  let progressHandler;

  beforeEach(() => {
    progressHandler = new ProgressHandler();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Progress States", () => {
    it("sollte initial NOT_STARTED zurückgeben", () => {
      const progress = progressHandler.getProgress(TEST_VIDEO_ID);
      expect(progress.state).toBe(PROGRESS_STATES.NOT_STARTED);
    });

    it("sollte IN_PROGRESS setzen wenn Zeit akkumuliert wird", () => {
      progressHandler.updateProgress(TEST_VIDEO_ID, {
        accumulatedTime: 15,
        completed: false,
      });
      expect(progressHandler.getProgress(TEST_VIDEO_ID).state).toBe(
        PROGRESS_STATES.IN_PROGRESS
      );
    });

    it("sollte COMPLETED setzen wenn Video abgeschlossen", () => {
      progressHandler.updateProgress(TEST_VIDEO_ID, {
        accumulatedTime: 30,
        completed: true,
      });
      expect(progressHandler.getProgress(TEST_VIDEO_ID).state).toBe(
        PROGRESS_STATES.COMPLETED
      );
    });
  });

  describe("Progress Tracking", () => {
    it("sollte Watch Count erhöhen bei Completion", () => {
      progressHandler.updateProgress(TEST_VIDEO_ID, { completed: true });
      progressHandler.updateProgress(TEST_VIDEO_ID, { completed: true });
      expect(progressHandler.getProgress(TEST_VIDEO_ID).watchCount).toBe(2);
    });

    it("sollte Last Watched aktualisieren", () => {
      const now = Date.now();
      jest.setSystemTime(now);

      progressHandler.updateProgress(TEST_VIDEO_ID, { completed: true });
      expect(progressHandler.getProgress(TEST_VIDEO_ID).lastWatched).toBe(now);
    });

    it("sollte akkumulierte Zeit korrekt tracken", () => {
      progressHandler.updateProgress(TEST_VIDEO_ID, {
        accumulatedTime: 15,
        completed: false,
      });
      progressHandler.updateProgress(TEST_VIDEO_ID, {
        accumulatedTime: 30,
        completed: false,
      });
      expect(progressHandler.getProgress(TEST_VIDEO_ID).accumulatedTime).toBe(
        30
      );
    });
  });

  describe("Progress Management", () => {
    it("sollte Progress zurücksetzen können", () => {
      progressHandler.updateProgress(TEST_VIDEO_ID, { completed: true });
      progressHandler.resetProgress(TEST_VIDEO_ID);

      const progress = progressHandler.getProgress(TEST_VIDEO_ID);
      expect(progress.state).toBe(PROGRESS_STATES.NOT_STARTED);
      expect(progress.watchCount).toBe(0);
    });

    it("sollte completed Status korrekt prüfen", () => {
      expect(progressHandler.isCompleted(TEST_VIDEO_ID)).toBe(false);
      progressHandler.updateProgress(TEST_VIDEO_ID, { completed: true });
      expect(progressHandler.isCompleted(TEST_VIDEO_ID)).toBe(true);
    });
  });
});

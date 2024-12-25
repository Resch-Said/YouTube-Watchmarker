import {
  getVideoIdFromUrl,
  handleVideoPlayback,
  VIDEO_TYPES,
  WATCH_THRESHOLDS,
} from "../src/videoUtils.js";

const TEST_VIDEO_ID = "_CY69RkXYlw";

// Test Suite 1: URL-Handling
describe("YouTube URL-Handler", () => {
  describe("Standard URLs", () => {
    it("sollte Video-ID aus Standard-Watch-URL extrahieren", () => {
      const url = `https://www.youtube.com/watch?v=${TEST_VIDEO_ID}`;
      expect(getVideoIdFromUrl(url)).toBe(TEST_VIDEO_ID);
    });

    it("sollte mit zusätzlichen URL-Parametern umgehen können", () => {
      const url = `https://www.youtube.com/watch?v=${TEST_VIDEO_ID}&t=123`;
      expect(getVideoIdFromUrl(url)).toBe(TEST_VIDEO_ID);
    });
  });

  describe("Spezial-URLs", () => {
    it("sollte Video-ID aus Shorts-URL extrahieren", () => {
      const url = `https://www.youtube.com/shorts/${TEST_VIDEO_ID}`;
      expect(getVideoIdFromUrl(url)).toBe(TEST_VIDEO_ID);
    });

    it("sollte Video-ID aus youtu.be-URL extrahieren", () => {
      const url = `https://youtu.be/${TEST_VIDEO_ID}`;
      expect(getVideoIdFromUrl(url)).toBe(TEST_VIDEO_ID);
    });

    it("sollte Video-ID aus Embed-URL extrahieren", () => {
      const url = `https://www.youtube.com/embed/${TEST_VIDEO_ID}`;
      expect(getVideoIdFromUrl(url)).toBe(TEST_VIDEO_ID);
    });
  });

  describe("Fehlerbehandlung", () => {
    it("sollte null für ungültige URLs zurückgeben", () => {
      const invalidUrls = [
        "https://example.com",
        "invalid-url",
        "",
        "https://youtube.com",
        `https://youtube.com/invalid/${TEST_VIDEO_ID}`,
      ];

      invalidUrls.forEach((url) => {
        expect(getVideoIdFromUrl(url)).toBeNull();
      });
    });
  });
});

// Test Suite 2: Video-Player Tracking
describe("Video-Player Handler", () => {
  let videoPlayer;
  let eventHandlers;
  let dateNowSpy;
  let currentTime;

  beforeEach(() => {
    currentTime = 0;
    dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => currentTime);
    eventHandlers = {};
    videoPlayer = {
      duration: 100,
      currentTime: 0,
      addEventListener: jest.fn((event, callback) => {
        eventHandlers[event] = callback;
      }),
      dispatchEvent: jest.fn(),
    };
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  describe("Standard Videos", () => {
    it("sollte die Wiedergabezeit korrekt verfolgen", () => {
      const handler = handleVideoPlayback(
        videoPlayer,
        TEST_VIDEO_ID,
        VIDEO_TYPES.STANDARD
      );
      currentTime = 31000;
      videoPlayer.currentTime = 31;
      eventHandlers.timeupdate();
      const progress = handler.getWatchProgress();
      expect(progress.accumulatedTime).toBeGreaterThan(
        WATCH_THRESHOLDS.standard.time
      );
    });

    it("sollte Videos nach Prozent-Schwelle als gesehen markieren", () => {
      const handler = handleVideoPlayback(videoPlayer, TEST_VIDEO_ID);
      videoPlayer.currentTime = videoPlayer.duration * 0.51;
      eventHandlers.timeupdate();
      expect(handler.getWatchProgress().completed).toBe(true);
    });
  });

  describe("Shorts Videos", () => {
    it("sollte Shorts mit angepassten Schwellenwerten tracken", () => {
      const handler = handleVideoPlayback(
        videoPlayer,
        TEST_VIDEO_ID,
        VIDEO_TYPES.SHORTS
      );
      currentTime = 16000;
      videoPlayer.currentTime = 16;
      eventHandlers.timeupdate();
      const progress = handler.getWatchProgress();
      expect(progress.accumulatedTime).toBeGreaterThan(
        WATCH_THRESHOLDS.shorts.time
      );
    });
  });

  describe("Video-Ende Handling", () => {
    it("sollte die Watch-History beim Video-Ende aktualisieren", () => {
      const handler = handleVideoPlayback(videoPlayer, TEST_VIDEO_ID);
      eventHandlers.ended();
      expect(handler.getWatchProgress().completed).toBe(true);
    });
  });
});

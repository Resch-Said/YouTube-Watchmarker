import { getVideoIdFromUrl, handleVideoPlayback } from '../src/videoUtils.js';

const TEST_VIDEO_ID = "_CY69RkXYlw";

describe("YouTube Watchmarker - Basis-Video-Tracking", () => {
  let videoPlayer;
  let videoId;
  let eventHandlers;

  beforeEach(() => {
    eventHandlers = {};
    videoPlayer = {
      duration: 100,
      currentTime: 0,
      addEventListener: jest.fn((event, callback) => {
        eventHandlers[event] = callback;
      }),
      dispatchEvent: jest.fn()
    };
    videoId = TEST_VIDEO_ID;
  });

  it("sollte die Video-ID korrekt extrahieren", () => {
    const url = `https://www.youtube.com/watch?v=${TEST_VIDEO_ID}`;
    const extractedId = getVideoIdFromUrl(url);
    expect(extractedId).toBe(videoId);
  });

  it("sollte die Wiedergabezeit korrekt verfolgen", () => {
    const handler = handleVideoPlayback(videoPlayer, videoId);
    videoPlayer.currentTime = 31;
    eventHandlers.timeupdate();
    expect(handler.state.accumulatedTime).toBeGreaterThan(0);
  });

  it("sollte das Video als gesehen markieren, wenn die Schwellenwerte erreicht sind", () => {
    const handler = handleVideoPlayback(videoPlayer, videoId);
    videoPlayer.currentTime = 51;
    eventHandlers.timeupdate();
    expect(handler.state.progressChecked).toBe(true);
  });

  it("sollte die Watch-History speichern, wenn das Video endet", () => {
    const handler = handleVideoPlayback(videoPlayer, videoId);
    eventHandlers.ended();
    expect(handler.state.progressChecked).toBe(true);
  });
});

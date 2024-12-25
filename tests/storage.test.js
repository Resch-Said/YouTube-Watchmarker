import { StorageManager, STORAGE_KEYS } from "../src/storageManager.js";

describe("Storage Manager", () => {
  let storageManager;
  let mockStorage;

  beforeEach(() => {
    // Mock console.error für sauberere Test-Ausgabe
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Mock chrome.storage.local
    mockStorage = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    };

    global.chrome = {
      storage: {
        local: mockStorage,
      },
    };

    storageManager = new StorageManager();
  });

  afterEach(() => {
    // Console.error wieder herstellen
    console.error.mockRestore();
  });

  describe("Watch History Management", () => {
    const testVideoId = "_CY69RkXYlw";
    const testProgress = {
      completed: true,
      watchedAt: Date.now(),
      type: "standard",
    };

    it("sollte Fortschritt speichern können", async () => {
      mockStorage.get.mockResolvedValue({ [STORAGE_KEYS.WATCH_HISTORY]: {} });
      mockStorage.set.mockResolvedValue();

      const result = await storageManager.saveProgress(
        testVideoId,
        testProgress
      );

      expect(result).toBe(true);
      expect(mockStorage.set).toHaveBeenCalled();
      const savedData =
        mockStorage.set.mock.calls[0][0][STORAGE_KEYS.WATCH_HISTORY];
      expect(savedData[testVideoId]).toMatchObject(testProgress);
    });

    it("sollte Watch-History abrufen können", async () => {
      const mockHistory = { [testVideoId]: testProgress };
      mockStorage.get.mockResolvedValue({
        [STORAGE_KEYS.WATCH_HISTORY]: mockHistory,
      });

      const history = await storageManager.getWatchHistory();
      expect(history).toEqual(mockHistory);
    });

    it("sollte einzelnen Video-Fortschritt abrufen können", async () => {
      const mockHistory = { [testVideoId]: testProgress };
      mockStorage.get.mockResolvedValue({
        [STORAGE_KEYS.WATCH_HISTORY]: mockHistory,
      });

      const progress = await storageManager.getVideoProgress(testVideoId);
      expect(progress).toEqual(testProgress);
    });

    it("sollte Fortschritt löschen können", async () => {
      const mockHistory = { [testVideoId]: testProgress };
      mockStorage.get.mockResolvedValue({
        [STORAGE_KEYS.WATCH_HISTORY]: mockHistory,
      });
      mockStorage.set.mockResolvedValue();

      const result = await storageManager.clearProgress(testVideoId);

      expect(result).toBe(true);
      expect(mockStorage.set).toHaveBeenCalled();
      const savedData =
        mockStorage.set.mock.calls[0][0][STORAGE_KEYS.WATCH_HISTORY];
      expect(savedData[testVideoId]).toBeUndefined();
    });

    it("sollte gesamte Watch-History löschen können", async () => {
      mockStorage.remove.mockResolvedValue();

      const result = await storageManager.clearAllProgress();

      expect(result).toBe(true);
      expect(mockStorage.remove).toHaveBeenCalledWith(
        STORAGE_KEYS.WATCH_HISTORY
      );
    });

    it("sollte Video-Titel mit speichern", async () => {
      const testTitle = "Test Video Title";
      mockStorage.get.mockResolvedValue({ [STORAGE_KEYS.WATCH_HISTORY]: {} });
      mockStorage.set.mockResolvedValue();

      const result = await storageManager.saveProgress(
        testVideoId,
        testProgress,
        testTitle
      );

      expect(result).toBe(true);
      expect(mockStorage.set).toHaveBeenCalled();
      const savedData =
        mockStorage.set.mock.calls[0][0][STORAGE_KEYS.WATCH_HISTORY];
      expect(savedData[testVideoId].title).toBe(testTitle);
    });

    it("sollte auch ohne Titel funktionieren", async () => {
      mockStorage.get.mockResolvedValue({ [STORAGE_KEYS.WATCH_HISTORY]: {} });
      mockStorage.set.mockResolvedValue();

      const result = await storageManager.saveProgress(
        testVideoId,
        testProgress
      );

      expect(result).toBe(true);
      const savedData =
        mockStorage.set.mock.calls[0][0][STORAGE_KEYS.WATCH_HISTORY];
      expect(savedData[testVideoId].title).toBe("");
    });

    it("sollte watchCount korrekt verwalten", async () => {
      mockStorage.get.mockResolvedValue({
        [STORAGE_KEYS.WATCH_HISTORY]: {
          [testVideoId]: { ...testProgress, watchCount: 2 },
        },
      });
      mockStorage.set.mockResolvedValue();

      // Speichere neuen Fortschritt für ein bereits gesehenes Video
      const result = await storageManager.saveProgress(testVideoId, {
        ...testProgress,
        completed: true,
      });

      expect(result).toBe(true);
      const savedData =
        mockStorage.set.mock.calls[0][0][STORAGE_KEYS.WATCH_HISTORY];
      expect(savedData[testVideoId].watchCount).toBe(3);
    });

    it("sollte watchCount nur bei completed erhöhen", async () => {
      mockStorage.get.mockResolvedValue({
        [STORAGE_KEYS.WATCH_HISTORY]: {
          [testVideoId]: { ...testProgress, watchCount: 1 },
        },
      });
      mockStorage.set.mockResolvedValue();

      // Speichere unvollständigen Fortschritt
      const result = await storageManager.saveProgress(testVideoId, {
        ...testProgress,
        completed: false,
      });

      expect(result).toBe(true);
      const savedData =
        mockStorage.set.mock.calls[0][0][STORAGE_KEYS.WATCH_HISTORY];
      expect(savedData[testVideoId].watchCount).toBe(1);
    });
  });

  describe("Fehlerbehandlung", () => {
    it("sollte Fehler beim Speichern abfangen", async () => {
      // Beide Operationen werfen Fehler
      mockStorage.get.mockRejectedValue(new Error("Storage error"));
      mockStorage.set.mockRejectedValue(new Error("Storage error"));

      const result = await storageManager.saveProgress("testId", {});
      expect(result).toBe(false);
    });

    it("sollte leeres Objekt bei Fehler zurückgeben", async () => {
      mockStorage.get.mockRejectedValue(new Error("Storage error"));

      const history = await storageManager.getWatchHistory();
      expect(history).toEqual({});
    });
  });
});

import { Settings, DEFAULT_SETTINGS } from "../src/settings.js";
import { StorageManager, STORAGE_KEYS } from "../src/storageManager.js";
import { jest } from '@jest/globals';

describe("Settings Manager", () => {
  let settings;

  beforeEach(() => {
    settings = new Settings();
  });

  // ...existing tests...
  describe("Threshold Management", () => {
    describe("Standard Thresholds", () => {
      it("sollte Standard-Schwellenwerte korrekt laden", () => {
        expect(settings.getThresholds("standard")).toEqual(
          DEFAULT_SETTINGS.thresholds.standard
        );
      });

      it("sollte benutzerdefinierte Schwellenwerte akzeptieren", () => {
        const customThresholds = { time: 45, percent: 60 };
        settings.updateThresholds("standard", customThresholds);
        expect(settings.getThresholds("standard")).toEqual({
          ...DEFAULT_SETTINGS.thresholds.standard,
          ...customThresholds,
        });
      });
    });

    describe("Shorts Thresholds", () => {
      it("sollte Shorts-Schwellenwerte korrekt laden", () => {
        expect(settings.getThresholds("shorts")).toEqual(
          DEFAULT_SETTINGS.thresholds.shorts
        );
      });

      it("sollte Shorts-spezifische Anpassungen erlauben", () => {
        settings.updateThresholds("shorts", { time: 10 });
        expect(settings.getThresholds("shorts").time).toBe(10);
      });
    });

    describe("Hover Thresholds", () => {
      it("sollte Hover-Schwellenwerte korrekt laden", () => {
        expect(settings.getThresholds("hover")).toEqual(
          DEFAULT_SETTINGS.thresholds.hover
        );
      });

      it("sollte Hover-Zeit anpassen können", () => {
        settings.updateThresholds("hover", { time: 0.8 });
        expect(settings.getThresholds("hover").time).toBe(0.8);
      });
    });

    describe("Fehlerbehandlung", () => {
      it("sollte bei ungültigem Video-Typ einen Fehler werfen", () => {
        expect(() => {
          settings.updateThresholds("invalid", { time: 30 });
        }).toThrow("Ungültiger Video-Typ");
      });

      it("sollte für unbekannte Typen Standard-Werte zurückgeben", () => {
        expect(settings.getThresholds("unknown")).toEqual(
          DEFAULT_SETTINGS.thresholds.standard
        );
      });
    });
  });

  describe("Tracking Control", () => {
    it("sollte Tracking-Status korrekt verwalten", () => {
      expect(settings.isTrackingEnabled("standard")).toBe(true);
      settings.toggleTracking("standard", false);
      expect(settings.isTrackingEnabled("standard")).toBe(false);
    });

    it("sollte verschiedene Video-Typen unabhängig verwalten", () => {
      settings.toggleTracking("standard", false);
      expect(settings.isTrackingEnabled("standard")).toBe(false);
      expect(settings.isTrackingEnabled("shorts")).toBe(true);
    });
  });

  describe("Settings Initialization", () => {
    it("sollte mit benutzerdefinierten Einstellungen initialisieren", () => {
      const customSettings = {
        thresholds: {
          standard: { time: 45 },
        },
      };
      const customizedSettings = new Settings(customSettings);
      expect(customizedSettings.getThresholds("standard").time).toBe(45);
      expect(customizedSettings.getThresholds("standard").percent).toBe(
        DEFAULT_SETTINGS.thresholds.standard.percent
      );
    });

    it("sollte Standard-UI-Einstellungen beibehalten", () => {
      const settings = new Settings();
      expect(settings.getSettings().ui).toEqual(DEFAULT_SETTINGS.ui);
    });
  });
});

describe("Settings Management", () => {
  let storageManager;
  let mockStorage;

  beforeEach(() => {
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

  describe("Settings Operations", () => {
    it("sollte Default-Settings zurückgeben wenn keine gespeichert", async () => {
      mockStorage.get.mockResolvedValue({});
      const settings = await storageManager.getSettings();
      expect(settings).toEqual({
        thresholds: {
          standard: {
            enabled: true,
            time: 30,
            percent: 50,
            percentMode: 'position'
          },
          shorts: {
            enabled: true,
            time: 15,
            percent: 30,
            percentMode: 'position'
          },
          hover: {
            enabled: true,
            time: 30,
            percent: 50,
            percentMode: 'position'
          }
        },
        ui: {
          grayscale: true,
          labels: true,
          dateFormat: "DD.MM.YYYY"
        }
      });
    });

    it("sollte Settings speichern können", async () => {
      const customSettings = {
        thresholds: {
          standard: { time: 45 },
        },
      };
      mockStorage.set.mockResolvedValue();

      const result = await storageManager.saveSettings(customSettings);
      expect(result).toBe(true);
      expect(mockStorage.set).toHaveBeenCalled();
    });

    it("sollte Settings zurücksetzen können", async () => {
      mockStorage.set.mockResolvedValue();

      const result = await storageManager.resetSettings();
      expect(result).toBe(true);
      expect(mockStorage.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.SETTINGS]: {
          thresholds: {
            standard: {
              enabled: true,
              time: 30,
              percent: 50,
              percentMode: 'position'
            },
            shorts: {
              enabled: true,
              time: 15,
              percent: 30,
              percentMode: 'position'
            },
            hover: {
              enabled: true,
              time: 30,
              percent: 50,
              percentMode: 'position'
            }
          },
          ui: {
            grayscale: true,
            labels: true,
            dateFormat: "DD.MM.YYYY"
          }
        },
      });
    });
  });

  describe("Fehlerbehandlung", () => {
    it("sollte bei Storage-Fehler Default-Settings zurückgeben", async () => {
      mockStorage.get.mockRejectedValue(new Error("Storage error"));

      const settings = await storageManager.getSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it("sollte Fehler beim Speichern abfangen", async () => {
      mockStorage.set.mockRejectedValue(new Error("Storage error"));

      const result = await storageManager.saveSettings({});
      expect(result).toBe(false);
    });
  });
});

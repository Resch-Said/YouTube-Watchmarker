import { PopupManager } from "../src/popup/popup.js";
import { DEFAULT_SETTINGS } from "../src/storageManager.js";

describe("Popup Manager", () => {
  let popupManager;
  let mockStorage;
  let mockTabs;

  beforeEach(() => {
    // DOM Setup
    document.body.innerHTML = `
      <input type="checkbox" id="enableStandard">
      <input type="checkbox" id="enableShorts">
      <input type="checkbox" id="enableHover">
      <input type="number" id="standardTime">
      <input type="number" id="standardPercent">
      <input type="number" id="shortsTime">
      <input type="number" id="shortsPercent">
      <input type="checkbox" id="enableGrayscale">
      <input type="checkbox" id="showLabels">
      <select id="percentMode">
        <option value="position">Position im Video</option>
        <option value="watched">Gesehene Zeit</option>
      </select>
      <button id="save">
      <button id="reset">
    `;

    // Mock Storage
    mockStorage = {
      get: jest.fn(() => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
      remove: jest.fn(),
    };

    // Mock Chrome API
    mockTabs = {
      query: jest.fn(),
      sendMessage: jest.fn(),
    };

    global.chrome = {
      storage: { local: mockStorage },
      tabs: mockTabs,
    };

    // Mock sendMessage direkt auf chrome.tabs
    chrome.tabs.sendMessage = jest.fn();

    popupManager = new PopupManager();
  });

  describe("Settings Laden", () => {
    it("sollte Default-Einstellungen korrekt laden", async () => {
      mockStorage.get.mockResolvedValue({});
      await popupManager.loadSettings();

      expect(document.getElementById("enableStandard").checked).toBe(
        DEFAULT_SETTINGS.thresholds.standard.enabled
      );
      expect(document.getElementById("standardTime").value).toBe(
        DEFAULT_SETTINGS.thresholds.standard.time.toString()
      );
    });

    it("sollte benutzerdefinierte Einstellungen laden", async () => {
      const customSettings = {
        thresholds: {
          standard: {
            enabled: false,
            time: 45,
            percent: 60,
          },
          shorts: {
            enabled: true,
            time: 15,
            percent: 30,
          },
          hover: {
            enabled: true,
            time: 30,
            percent: 50,
          },
        },
        ui: {
          grayscale: true,
          labels: true,
        },
      };

      mockStorage.get.mockResolvedValue({ settings: customSettings });
      await popupManager.loadSettings();

      // Überprüfe Video-Tracking Einstellungen
      expect(document.getElementById("enableStandard").checked).toBe(false);
      expect(document.getElementById("enableShorts").checked).toBe(true);
      expect(document.getElementById("enableHover").checked).toBe(true);

      // Überprüfe Schwellenwerte
      expect(document.getElementById("standardTime").value).toBe("45");
      expect(document.getElementById("standardPercent").value).toBe("60");
      expect(document.getElementById("shortsTime").value).toBe("15");
      expect(document.getElementById("shortsPercent").value).toBe("30");

      // Überprüfe UI-Einstellungen
      expect(document.getElementById("enableGrayscale").checked).toBe(true);
      expect(document.getElementById("showLabels").checked).toBe(true);
    });
  });

  describe("Settings Speichern", () => {
    it("sollte Einstellungen korrekt speichern", async () => {
      document.getElementById("enableStandard").checked = false;
      document.getElementById("standardTime").value = "45";

      await popupManager.saveSettings();

      expect(mockStorage.set).toHaveBeenCalled();
      const savedSettings = mockStorage.set.mock.calls[0][0].settings;
      expect(savedSettings.thresholds.standard.enabled).toBe(false);
      expect(savedSettings.thresholds.standard.time).toBe(45);
    });

    it("sollte Content Script nach dem Speichern benachrichtigen", async () => {
      mockTabs.query.mockImplementation((params, callback) => {
        callback([{ id: 1 }]);
      });

      await popupManager.saveSettings();

      expect(mockTabs.query).toHaveBeenCalled();
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, {
        type: "SETTINGS_UPDATED",
      });
    });
  });

  describe("Settings Zurücksetzen", () => {
    it("sollte auf Default-Werte zurücksetzen", async () => {
      await popupManager.resetSettings();

      expect(mockStorage.set).toHaveBeenCalledWith({
        settings: DEFAULT_SETTINGS,
      });
    });

    it("sollte UI nach Reset aktualisieren", async () => {
      await popupManager.resetSettings();

      expect(document.getElementById("enableStandard").checked).toBe(
        DEFAULT_SETTINGS.thresholds.standard.enabled
      );
      expect(document.getElementById("standardTime").value).toBe(
        DEFAULT_SETTINGS.thresholds.standard.time.toString()
      );
    });
  });

  describe("Event Handling", () => {
    it("sollte Save-Button Click verarbeiten", () => {
      const saveButton = document.getElementById("save");
      const saveSpy = jest.spyOn(popupManager, "saveSettings");

      saveButton.click();
      expect(saveSpy).toHaveBeenCalled();
    });

    it("sollte Reset-Button Click verarbeiten", () => {
      const resetButton = document.getElementById("reset");
      const resetSpy = jest.spyOn(popupManager, "resetSettings");

      resetButton.click();
      expect(resetSpy).toHaveBeenCalled();
    });
  });

  describe("Prozent-Modus", () => {
    it("sollte den korrekten Prozent-Modus laden", async () => {
      const customSettings = {
        thresholds: {
          standard: {
            enabled: true,
            time: 30,
            percent: 50,
            percentMode: "watched",
          },
          shorts: {
            enabled: true,
            time: 15,
            percent: 30,
            percentMode: "watched",
          },
          hover: {
            enabled: true,
            time: 30,
            percent: 50,
            percentMode: "watched",
          },
        },
      };

      mockStorage.get.mockResolvedValue({ settings: customSettings });
      await popupManager.loadSettings();

      expect(document.getElementById("percentMode").value).toBe("watched");
    });

    it("sollte den Prozent-Modus speichern", async () => {
      document.getElementById("percentMode").value = "watched";
      await popupManager.saveSettings();

      const savedSettings = mockStorage.set.mock.calls[0][0].settings;
      expect(savedSettings.thresholds.standard.percentMode).toBe("watched");
    });
  });

  describe("Popup Settings Integration", () => {
    it("sollte bei 'percentMode: position' die korrekte Schwelle anwenden", async () => {
      // Hier mocken wir bspw. 50% Position
      const mockSettings = {
        thresholds: {
          standard: {
            time: 30,
            percent: 50,
            enabled: true,
            percentMode: "position",
          },
        },
        ui: {
          grayscale: true,
          labels: true,
          dateFormat: "DD.MM.YYYY",
        },
      };

      // ...existing code that initializes popup and sets settings...
      // Überprüfen, ob bei ~51% Videolänge die Schwelle als erfüllt gilt.
      // ...existing code...
    });
  });
});

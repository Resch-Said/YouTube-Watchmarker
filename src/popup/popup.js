import { StorageManager, STORAGE_KEYS, DEFAULT_SETTINGS } from '../storageManager.js';

export class PopupManager {
  constructor() {
    this.storage = new StorageManager();
    this.initializeEventListeners();
    this.loadSettings();
  }

  async loadSettings() {
    const settings = await this.storage.getSettings();
    const ui = settings.ui || DEFAULT_SETTINGS.ui;
    
    // Video Tracking
    document.getElementById('enableStandard').checked = settings.thresholds.standard.enabled;
    document.getElementById('enableShorts').checked = settings.thresholds.shorts.enabled;
    document.getElementById('enableHover').checked = settings.thresholds.hover.enabled;

    // Schwellenwerte
    document.getElementById('standardTime').value = settings.thresholds.standard.time;
    document.getElementById('standardPercent').value = settings.thresholds.standard.percent;
    document.getElementById('shortsTime').value = settings.thresholds.shorts.time;
    document.getElementById('shortsPercent').value = settings.thresholds.shorts.percent;

    // Prozent-Modus
    document.getElementById('percentMode').value = settings.thresholds.standard.percentMode;

    // UI Settings
    document.getElementById('enableGrayscale').checked = ui.grayscale;
    document.getElementById('showLabels').checked = ui.labels;
  }

  async saveSettings() {
    const settings = {
      thresholds: {
        standard: {
          enabled: document.getElementById('enableStandard').checked,
          time: parseInt(document.getElementById('standardTime').value),
          percent: parseInt(document.getElementById('standardPercent').value),
          percentMode: document.getElementById('percentMode').value
        },
        shorts: {
          enabled: document.getElementById('enableShorts').checked,
          time: parseInt(document.getElementById('shortsTime').value),
          percent: parseInt(document.getElementById('shortsPercent').value),
          percentMode: document.getElementById('percentMode').value
        },
        hover: {
          enabled: document.getElementById('enableHover').checked,
          percentMode: document.getElementById('percentMode').value
        }
      },
      ui: {
        grayscale: document.getElementById('enableGrayscale').checked,
        labels: document.getElementById('showLabels').checked
      }
    };

    await this.storage.saveSettings(settings);
    this.notifyContentScript();
  }

  notifyContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SETTINGS_UPDATED' });
      }
    });
  }

  initializeEventListeners() {
    document.getElementById('save').addEventListener('click', () => this.saveSettings());
    document.getElementById('reset').addEventListener('click', () => this.resetSettings());
  }

  async resetSettings() {
    await this.storage.resetSettings();
    await this.loadSettings();
    this.notifyContentScript();
  }
}

// Nur im Production-Build ausführen
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
  });
}

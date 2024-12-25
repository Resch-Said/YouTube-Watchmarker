export const DEFAULT_SETTINGS = {
  thresholds: {
    standard: {
      time: 30, // 30 Sekunden
      percent: 50, // 50% der Gesamtlänge
      enabled: true,
      percentMode: 'position'
    },
    shorts: {
      time: 15, // 15 Sekunden
      percent: 30, // 30% der Gesamtlänge
      enabled: true,
      percentMode: 'position'
    },
    hover: {
      time: 30, // 30 Sekunden
      percent: 50, // 50% der Gesamtlänge
      enabled: true,
      percentMode: 'position'
    },
  },
  ui: {
    grayscale: true,
    labels: true,
    dateFormat: "DD.MM.YYYY",
  },
};

export class Settings {
  constructor(initialSettings = {}) {
    this.settings = this.mergeWithDefaults(initialSettings);
  }

  mergeWithDefaults(customSettings) {
    return {
      thresholds: Object.fromEntries(
        Object.entries(DEFAULT_SETTINGS.thresholds).map(([type, defaults]) => [
          type,
          {
            ...defaults,
            ...(customSettings.thresholds?.[type] || {}),
          },
        ])
      ),
      ui: {
        ...DEFAULT_SETTINGS.ui,
        ...customSettings.ui,
      },
    };
  }

  getThresholds(videoType) {
    return (
      this.settings.thresholds[videoType] ||
      DEFAULT_SETTINGS.thresholds.standard
    );
  }

  updateThresholds(videoType, newThresholds) {
    if (!this.settings.thresholds[videoType]) {
      throw new Error(`Ungültiger Video-Typ: ${videoType}`);
    }

    this.settings.thresholds[videoType] = {
      ...this.settings.thresholds[videoType],
      ...newThresholds,
    };
  }

  isTrackingEnabled(videoType) {
    const thresholds = this.getThresholds(videoType);
    return thresholds.enabled;
  }

  toggleTracking(videoType, enabled) {
    if (this.settings.thresholds[videoType]) {
      this.settings.thresholds[videoType].enabled = enabled;
    }
  }

  getSettings() {
    return { ...this.settings };
  }
}

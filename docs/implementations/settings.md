# Settings Implementation

[Timestamp: 2024-03-21]
**Priority: High**

## Architektur

- Zentrale Settings-Klasse
- Deep-Merge für Konfigurationen
- Typ-spezifische Schwellenwerte
- Immutable Updates

## Features

- Video-Typ-spezifische Einstellungen
- Flexible Schwellenwert-Anpassung
- UI-Konfiguration
- Toggle-Funktionalität für Features

## Schwellenwerte

```javascript
standard: { time: 30, percent: 50 }  // Standard Videos
shorts: { time: 15, percent: 30 }    // Shorts Format
hover: { time: 30, percent: 50 }     // Hover Preview (gleich wie Standard)
```

## Best Practices

- Deep-Merge für robuste Defaults
- Immutable State Updates
- Typsichere Konfiguration
- Getrennte UI- und Tracking-Einstellungen

## Test-Abdeckung

✅ Standard-Werte
✅ Benutzerdefinierte Einstellungen
✅ Video-Typ-spezifische Updates
✅ Fehlerbehandlung
✅ Toggle-Funktionalität

#tags: settings, configuration, thresholds

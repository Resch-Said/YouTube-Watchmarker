# YouTube Watchmarker Extension Notes

## Projektziele und Anforderungen

[Timestamp: 2024-03-19]
**Priority: High**

### Hauptfunktionen

- Automatische Erkennung und Markierung gesehener YouTube Videos und Shorts
- Visuelle Markierung durch:
  - Ausgegraute Thumbnails (mit Hover-Effekt)
  - "Watched" Label (oben links)
  - Ansichtsdatum (oben rechts)
- Logging-System mit [Watchmarker] Prefix

### Technische Anforderungen

- Chrome Extension mit Manifest V3
- Persistente Speicherung der Watch-History
- Effiziente DOM-Manipulation
- Umfangreiches Logging-System

### Tags

#project-requirements #features #ui-design

## Performance & Optimierung

[Timestamp: 2024-03-21]
**Priority: High**

### Aktuelle Implementierung

- Cache-System für Watch-History
- DOM-Manipulationen optimiert (10ms Pausen)
- Hover-Effekt für Thumbnails
- Konfigurierbare Wiedergabe-Bedingungen:
  - Normale Videos: 30s oder 50%
  - Shorts: 15s oder 30%
  - Hover-Previews: Anpassbar
- Unterstützung für Videos und Shorts
- Verbesserte Video-ID-Extraktion

### Wichtige Anmerkungen

- Keine Icons in Manifest
- Separates CSS für Hover-Effekte
- Event-Listener-Optimierung

### Tags

#performance #optimization #shorts #video-detection #hover-effect

## Performance-Optimierung Update

[Timestamp: 2024-03-21]
**Priority: High**

### Implementierte Optimierungen

- Cache-System erweitert:

  - Einführung von `processedVideos` und `processedHovers` Sets
  - Regelmäßige Cache-Bereinigung (alle 30s)
  - Optimierte Speichernutzung

- DOM-Manipulationen verbessert:

  - Selektive Verarbeitung mit `:not([data-watchmarker-processed])`
  - Reduzierte Observer-Events (ignoriert Attribute/Text)
  - Passive Event-Listener für bessere Scroll-Performance

- Timing-Optimierungen:
  - Throttling für Observer (1.5s Verzögerung)
  - Kürzere Hover-Check-Intervalle (250ms)
  - Prozess-Intervall auf 3s erhöht
  - Reduzierte Hover-Check-Versuche (5 statt 10)

### Konfigurierbare Konstanten

```javascript
CACHE_UPDATE_INTERVAL = 30000; // Cache-Reset
PROCESS_INTERVAL = 3000; // Hauptprozess
THROTTLE_DELAY = 1500; // Observer-Throttling
HOVER_CHECK_INTERVAL = 250; // Hover-Erkennung
```

### Ergebnisse

- Deutlich reduzierte CPU-Last
- Verbesserte Reaktionszeit
- Stabilere Performance bei vielen Videos
- Geringerer Speicherverbrauch

### Tags

#performance #optimization #caching #dom-manipulation

## Video-Typ-Erkennung Update

[Timestamp: 2024-03-21]
**Priority: High**

### Änderungen

- Verbesserte Typ-Erkennung:
  - Normal: Standard-Videos
  - Hover: Video-Vorschauen beim Hover
  - Shorts: YouTube Shorts
  - Shorts-Hover: Shorts-Vorschauen beim Hover
- Optimierte Logging-Ausgaben:
  - Kompakteres Format
  - Relevante Fortschrittsinformationen
  - Typ-spezifische Zielwerte

### Standardwerte

- Normale Videos: 30s oder 50%
- Shorts: 15s oder 30%
- Hover: Konfigurierbar (Standard wie Normal)
- Shorts-Hover: Konfigurierbar (Standard wie Shorts)

### Tags

#video-types #logging #user-experience

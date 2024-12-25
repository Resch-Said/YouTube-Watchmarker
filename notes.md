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

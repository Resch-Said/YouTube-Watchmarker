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

## Error Handling System

[Timestamp: 2024-01-19]
**Priority: High**

### Implementation Details

- Created centralized error handling system using FehlerManifest.json
- Structured error messages by categories:
  - Storage errors
  - Video-related errors
  - General errors

### Best Practices

- Use consistent error message format
- Centralize error messages for easier maintenance
- Categories help with organization and debugging

### TODOs

- [ ] Implement error logging system
- [ ] Add error tracking analytics
- [ ] Create error handling utility functions

### Tags

#error-handling #maintenance #architecture

## Fehlerbehandlung Update

[Timestamp: 2024-03-19]
**Priority: High**

### FehlerManifest Implementation

- Zentrale JSON-Datei für alle Fehlermeldungen
- Kategorisierte Struktur:
  - Extension Fehler
  - Storage Fehler
  - Video-bezogene Fehler
- Version und Zeitstempel für Änderungsverfolgung

### Verwendung

```typescript
import errors from "../public/FehlerManifest.json";
// Beispiel: errors.storage.read
```

### Tags

#error-handling #json #maintenance

## FehlerManifest Update

[Timestamp: 2024-03-19]
**Priority: High**

### Fehlerbehebung

- JSON-Syntax-Fehler in FehlerManifest.json behoben
- Struktur überarbeitet und vereinfacht
- Deutsche Fehlermeldungen implementiert

### Verwendungsbeispiel

```typescript
import fehler from "../public/FehlerManifest.json";
console.error(fehler.storage.lesen);
```

### Tags

#bugfix #error-handling #localization

## Manifest Fehlerbehebung
[Timestamp: 2024-03-19]
**Priority: High**

### Änderungen
- manifest.json korrekt formatiert
- JSON-Syntax-Fehler behoben

### Best Practices
- Manifest muss valides JSON sein
- Keine Kommentare in JSON-Dateien

### Tags
#bugfix #manifest #configuration

# YouTube Watchmarker Extension

Eine Chrome-Erweiterung, die automatisch gesehene YouTube-Videos und Shorts markiert und visuell hervorhebt.

## Features

- **Automatische Erkennung** von gesehenen Videos und Shorts
- **Visuelle Markierung**:
  - Ausgegraute Thumbnails (mit Hover-Effekt zur Originalansicht)
  - "Watched" Label in der oberen linken Ecke
  - Ansichtsdatum in der oberen rechten Ecke
- **Konfigurierbare Erkennungsbedingungen** für:
  - Normale Videos
  - Shorts
  - Hover-Vorschauen

## Installation

1. Lade das Repository herunter
2. Öffne Chrome und navigiere zu `chrome://extensions/`
3. Aktiviere den "Entwicklermodus" (oben rechts)
4. Klicke auf "Entpackte Erweiterung laden"
5. Wähle den Projektordner aus

## Einstellungen

### Normale Videos

- Zeit bis "Watched": 30 Sekunden (Standard)
- Fortschritt bis "Watched": 50% (Standard)

### Shorts

- Zeit bis "Watched": 15 Sekunden (Standard)
- Fortschritt bis "Watched": 30% (Standard)

### Hover-Vorschauen

- Konfigurierbare separate Einstellungen
- Verwendet standardmäßig die Einstellungen der jeweiligen Videotypen

## Features im Detail

### Watch-History

- Persistente Speicherung der Wiedergabehistorie
- Möglichkeit zum Zurücksetzen über das Popup-Menü
- Automatische Cache-Optimierung

### Daten-Management

- **Export**: Speichern aller Einstellungen und der Watch-History als JSON-Datei
- **Import**: Wiederherstellen von Einstellungen und Watch-History aus einer Backup-Datei
- **Zurücksetzen**: Komplettes Leeren der Watch-History

### Performance

- Optimierte DOM-Manipulation
- Intelligentes Caching-System
- Ressourcenschonende Event-Verarbeitung
- Anpassbare Verzögerungszeiten

## Entwickler

### Technische Details

- Implementiert mit Manifest V3
- Verwendet Chrome Storage API
- Modularer Code-Aufbau
- Umfangreiches Logging-System

### Debug-Informationen

- Alle Logs haben den Prefix [Watchmarker]
- Performance-Metriken in der Konsole
- Detaillierte Statusmeldungen

## Lizenz

MIT-Lizenz

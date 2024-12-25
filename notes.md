# YouTube Watchmarker

## Projektziele und Anforderungen

- Automatische Erkennung und Markierung von gesehenen YouTube Videos und Shorts
- Visuelle Markierung:
  - Ausgegrautes Thumbnail (30% Graustufen)
  - "Watched" Marker oben links
  - Datum der Ansicht oben rechts
- Speicherung der Daten in Chrome Storage mit Timestamp

## Technische Entscheidungen

- Verwendung von Chrome Storage zur Speicherung der gesehenen Videos und Timestamps
- Markierung von Videos, wenn 30% des Videos angeschaut wurden
- Verwendung von CSS für die visuelle Markierung

## TODOs und zukünftige Verbesserungen

- Verbesserung der Erkennungslogik für YouTube Shorts
- Optimierung der Performance bei der Markierung von Videos
- Hinzufügen von Optionen für Benutzer, um die Markierung anzupassen

## Debugging & Fehlerbehebung

### Initialisierungs-Reihenfolge

1. Warte auf DOMContentLoaded
2. Verzögere Initialisierung um 1.5s
3. Setup Observer für Content Container
4. Beobachte neue Thumbnails
5. Markiere Videos bei Änderungen

### YouTube DOM-Struktur

- Content Container: `#content` oder `ytd-rich-grid-renderer`
- Video Thumbnails:
  - `ytd-rich-item-renderer`
  - `ytd-compact-video-renderer`
  - `ytd-video-renderer`

## YouTube DOM-Analyse

### Thumbnail Hierarchie [Priorität: Hoch]

```
ytd-rich-item-renderer
└── #content
    └── ytd-rich-grid-media
        └── #dismissible
            └── #thumbnail
                └── ytd-thumbnail
                    └── a#thumbnail.yt-simple-endpoint [enthält href mit video-id]
                        └── yt-image [enthält das eigentliche Thumbnail-Bild]
```

### Wichtige Selektoren [Priorität: Hoch]

- Hauptcontainer: `ytd-rich-item-renderer`
- Thumbnail-Link: `a#thumbnail.yt-simple-endpoint[href*="watch?v="]`
- Bild-Container: `yt-image`
- Video-ID: Im href-Attribut des a-Tags

### Marker-Platzierung [Priorität: Medium]

- Optimal: Direkt unter `ytd-thumbnail`
- Alternativen:
  1. Innerhalb `#thumbnail`
  2. Nach `yt-image`

### Timing-Probleme

- YouTube lädt Inhalte dynamisch
- Content Container möglicherweise nicht sofort verfügbar
- Thumbnails werden nach und nach geladen

### Storage-Struktur

- Format: `{ videoId: { timestamp: string, watched: boolean } }`
- Wichtig: Storage muss als Objekt initialisiert werden, nicht als Array
- Fehlerhafte Array-Initialisierung kann zu leeren Ergebnissen führen

### Storage-Debugging

1. Öffne Chrome DevTools
2. Gehe zu Application > Storage > Local Storage
3. Überprüfe `watchedVideos` Struktur
4. Erwartetes Format: `{}`

### Häufige Fehler

- Storage als Array statt Objekt initialisiert
- Fehlende Konvertierung zwischen Array und Objekt
- Storage-Zugriff vor vollständiger Initialisierung

### Storage-Zugriff [Priorität: Hoch]

- Storage wird korrekt initialisiert und enthält Videos
- Content Script kann auf Storage zugreifen
- Format: `{ videoId: { timestamp: string, watched: boolean } }`

### Thumbnail-Markierung [Priorität: Hoch]

- Problem: Thumbnails werden nicht markiert trotz vorhandener Videos
- Mögliche Ursachen:
  1. Timing: YouTube lädt Thumbnails verzögert
  2. Selektoren: Möglicherweise nicht alle Varianten abgedeckt
  3. DOM-Struktur: YouTube ändert dynamisch die Struktur

### Lösungsansätze [Priorität: Hoch]

1. Verzögerung vor Markierung einbauen
2. Erweiterte Selektoren für alle Thumbnail-Varianten
3. Verbesserte Debug-Ausgaben für DOM-Struktur

## Timestamps

- 2023-10-XX: Initiale Implementierung der Erweiterung
- 2023-10-XX: Storage-Debug hinzugefügt
- 2023-10-XX: Storage-Struktur von Array zu Objekt geändert
- 2023-10-XX: Verbesserte Initialisierungslogik für YouTube's dynamisches Laden
- 2023-10-XX: YouTube DOM-Struktur analysiert und dokumentiert
- 2023-10-XX: Verbesserte Storage- und Markierungslogik

# Kernfunktionalitäten

## Backend

- Chrome Storage Verwaltung
- Message Handling
- Video Tracking

## Frontend

- Video Markierung mit CSS
- Popup Interface
- DOM Beobachtung

## Utilities

- Logging System
- Debug Funktionen
- Helper Funktionen

# TODOs und zukünftige Verbesserungen

- [ ] Erweiterung der Video Markierungslogik
- [ ] Verbesserung der DOM Beobachtung
- [ ] Optimierung der Speicherverwaltung

_Hinzugefügt am: [aktuelles Datum und Uhrzeit]_

# Projekt Notizen

## Änderungen vom [Datum]

### Content Script Initialisierung

- DOMContentLoaded Event Listener hinzugefügt
- Wartezeit auf 3 Sekunden erhöht

### Logger

- Logger aktiviert (`enabled: true`)
- Testnachricht hinzugefügt

### Chrome API

- Verfügbarkeit der Chrome API überprüft

### Storage

- Logging für Storage Zugriff hinzugefügt

### Manifest

- `run_at` in `content_scripts` auf `document_start` gesetzt

## TODOs

- [ ] Überprüfen, ob die Extension in Chrome aktiviert ist
- [ ] DevTools auf YouTube.com öffnen und Console Tab auf Fehlermeldungen prüfen
- [ ] Application Tab unter Storage > Local Storage überprüfen
````

# Projektinformationen

## Projektziele und Anforderungen
- Verbesserung der CSS-Selektoren und -Stile für YouTube Video-Thumbnails und Watched-Labels

## Aktuelle Aufgaben und Fortschritt
- [x] Verbesserung der Selektoren-Spezifität
- [x] Anpassung der Opacity und Graustufenwerte
- [x] Hinzufügen eines Übergangseffekts
- [x] Anpassung des z-index

## Technische Entscheidungen und deren Begründung
- Verwendung spezifischerer Selektoren mit `.yt-video-container` zur Vermeidung von Stilkonflikten
- Reduzierung der Opacity auf 0.7 für besseren Kontrast
- Hinzufügen eines sanften Übergangseffekts für eine bessere Benutzererfahrung

## Problemlösungen und Workarounds
- Zusammenfassung aller alten Styles in einem Block zur besseren Übersichtlichkeit

## Best Practices
- Verwendung von `!important` für kritische Styles, um sicherzustellen, dass sie angewendet werden

## Code-Muster und Architekturentscheidungen
- Spezifische Selektoren zur Vermeidung von Stilkonflikten
- Verwendung von `rgba` für Hintergrundfarben zur besseren Kontrolle der Transparenz

## Wichtige TODOs und zukünftige Verbesserungen
- [ ] Überprüfung der Kompatibilität mit verschiedenen YouTube-Themes
- [ ] Optimierung der Performance bei vielen Videos auf einer Seite

## Tags
- #CSS
- #YouTube
- #ChromeExtension
- #BestPractices

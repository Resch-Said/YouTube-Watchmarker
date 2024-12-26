# YouTube Watchmarker - Anforderungen

## Funktionale Anforderungen

### Kernfunktionen

- Markierung bereits gesehener YouTube-Videos
  - Automatische Erkennung basierend auf konfigurierbaren Kriterien:
    - Separate Kriterien für verschiedene Videotypen:
      - Normale Videos
      - YouTube Shorts
      - Hover-Previews (Thumbnails)
        - Minimum-Hover-Zeit vor Tracking-Start
        - Option zum kompletten Deaktivieren des Hover-Trackings
    - Konfigurierbare Erkennungskriterien pro Typ:
      - Tracking-Modus wählbar:
        - Positionsbasiert (Abspielposition im Video)
        - Zeitbasiert (Tatsächliche Betrachtungszeit)
      - Schwellenwerte je nach Modus:
        - Positionsbasiert: Prozentsatz des Fortschrittsbalkens
        - Zeitbasiert: Betrachtungszeit in Sekunden
      - Kombinierbare Bedingungen (UND/ODER)
  - Fortschrittsanzeige pro Video
    - Anzeige der aktuellen Betrachtungszeit in Sekunden
    - Anzeige der aktuellen Position im Video (Prozent)
    - Konfigurierbare Position der Anzeige:
      - Im Thumbnail (Oben-Links, Oben-Rechts, Unten-Links, Unten-Rechts)
      - Über dem Thumbnail (Links, Rechts)
      - Unter dem Thumbnail (Links, Rechts)
    - Formatierungsoptionen für die Anzeige:
      - Schriftgröße und -farbe
      - Hintergrundfarbe und Transparenz
      - Format der Zeitanzeige (z.B. "MM:SS" oder "XXX Sekunden")
      - Format der Prozentanzeige (z.B. "50%" oder "0.5")
  - Manuelle Markierung/Demarkierung von Videos möglich
  - Visuelle Kennzeichnung gesehener Videos in der Oberfläche
  - Ausblenden gesehener Videos:
    - Automatisches Entfernen gesehener Videos aus der Ansicht
    - Separate Aktivierung für:
      - Normale Videos
      - Shorts
      - Playlist-Einträge
    - "Show All" Toggle-Button zum temporären Einblenden
    - Keyboard-Shortcut zum Toggle (z.B. Alt+H)
    - Statistik-Anzeige der ausgeblendeten Videos

### Benutzeroberfläche

- Einstellungsmenü für die Extension
  - Konfiguration der "Gesehen"-Kriterien:
    - Separate Einstellungen für Videos, Shorts und Previews
    - Auswahl des Tracking-Modus:
      - Positionsbasiert oder Zeitbasiert
      - Separate Einstellung pro Videotyp möglich
    - Schwellenwerte je nach Modus:
      - Positionsbasiert: Prozentsatz (z.B. "50% des Videos erreicht")
      - Zeitbasiert: Sekunden (z.B. "30 Sekunden angesehen")
    - Verknüpfungslogik der Kriterien (Beide erfüllt/Eines erfüllt)
  - Konfiguration der Fortschrittsanzeige:
    - Position (Im/Über/Unter Thumbnail)
    - Genaue Ausrichtung (Links/Rechts/Oben/Unten)
    - Formatierung und Stil
    - Ein-/Ausblenden einzelner Elemente (Zeit/Prozent)
  - Ein/Ausschalten der automatischen Markierung
  - Möglichkeit zum Zurücksetzen aller Markierungen
  - Anpassung der visuellen Kennzeichnung:
    - Farben und Symbole der Labels
    - Positionierung der Labels:
      - Separate Positionswahl für "Watched"-Label und Datum
      - Verfügbare Positionen: Oben-Links, Oben-Rechts, Unten-Links, Unten-Rechts
      - Automatische Stapelung bei gleicher Position (Datum unter "Watched"-Label)
      - Vorschau der gewählten Positionierung
    - Schriftgröße und Transparenz der Labels
    - Option zum Ein-/Ausblenden des Ansehungsdatums
    - Thumbnail-Visualisierung:
      - Ein-/Ausschalten der Graustufen-Funktion
      - Einstellung der Graustufen-Intensität (0-100%)
      - Live-Vorschau der Graustufen-Einstellung
      - Option für zusätzliche Verdunkelung

### Datenverwaltung

- Persistente Speicherung der Markierungen
  - Lokale Speicherung im Browser
  - Cloud-Synchronisation über verschiedene Anbieter:
    - OneDrive Integration
    - Google Drive Integration
    - Automatische Konfliktlösung bei gleichzeitiger Bearbeitung
    - Regelmäßige automatische Synchronisation
    - Manueller Sync-Button für sofortige Aktualisierung
    - Keine Verschlüsselung notwendig, da keine sensiblen Daten gespeichert werden
- Export/Import-Funktion für Markierungen und Einstellungen
  - Export als JSON-Datei
  - Import von JSON-Dateien
  - Zurücksetzen der Markierungen

### Watchlist-Verwaltung

- Automatische Erkennung bereits gesehener Videos

  - Analyse der YouTube-Wiedergabeverlauf API
  - Automatisches Hinzufügen zur Watchlist
  - Keine erneute Wiedergabe erforderlich
  - Periodische Überprüfung auf neue gesehene Videos

- Detaillierte Watchlist-Ansicht

  - Tabellarische Übersicht aller gesehenen Videos
  - Spalten:
    - Thumbnail des Videos
    - Videotitel
    - Video-URL
    - Anzahl der Aufrufe
    - Erstes Ansehen (Datum)
    - Letztes Ansehen (Datum)
    - Gesamtanzahl Aufrufe
  - Sortier- und Filterfunktionen
  - Suchfunktion für Videos
  - Export der Liste als CSV/JSON

- Persistente Datenspeicherung
  - Dauerhafte Speicherung in Chrome Storage
  - Keine automatische Löschung
  - Manuelles Löschen einzelner Einträge
  - Option zum kompletten Zurücksetzen
  - Backup-Funktion für Watchlist-Daten

## Nicht-funktionale Anforderungen

### Performance

- Schnelle Ladezeiten der Extension
- Minimale Auswirkung auf die YouTube-Performance
- Effiziente Datenspeicherung
- Fortschrittsanzeige während der Verarbeitung
- Visuelles Feedback bei Markierungsänderungen
- Tooltips für Einstellungsoptionen
- Implementierung eines In-Memory-Caches:
  - Cache-Timeout: 30 Sekunden
  - Automatische Cache-Invalidierung
  - Maximale Cache-Größe: 1000 Einträge
  - Cache-Priorität für aktuell sichtbare Videos

### Sicherheit & Datenschutz

- Keine Sammlung personenbezogener Daten
- Einfache Speicherung der Markierungen als .json-Datei
- Transparente Datennutzung
- Standard OAuth-Authentifizierung für Cloud-Dienste
- Möglichkeit zum Widerruf der Cloud-Zugriffsrechte

### Kompatibilität

- Unterstützung moderner Browser (Chrome, Edge)
- Kompatibilität mit YouTube-Layout-Änderungen
- Responsive Design für verschiedene Bildschirmgrößen

### Wartbarkeit

- Modularer Code-Aufbau
- Ausführliche Dokumentation
- Einfache Aktualisierbarkeit

## Technische Anforderungen

- Entwicklung als Browser-Extension
- Verwendung moderner Web-Technologien
- Einhaltung der Extension-Store-Richtlinien
- Optimierte Ressourcennutzung
- Einfache Integration der Cloud-Provider APIs
- Implementierung robuster Offline-Funktionalität
- Grundlegendes Konfliktmanagement bei der Synchronisation
- Entwickler-Logging System:
  - Einheitliches Logging-Format mit "[Watchmarker]" Prefix
  - Konfigurierbare Log-Level (ERROR, WARN, INFO, DEBUG)
  - Ein-/Ausschaltbar über Extension-Einstellungen
  - Farbcodierte Konsolenausgaben für bessere Übersichtlichkeit
  - Performance-Logging für kritische Operationen
  - Gruppierte Logs für zusammenhängende Operationen

## Technische Entwicklungsstandards

### Clean Code Prinzipien

- Einhaltung der SOLID-Prinzipien:

  - Single Responsibility: Eine Klasse/Funktion = Eine Aufgabe
  - Open/Closed: Erweiterbar ohne Änderungen
  - Liskov Substitution: Korrekte Vererbungshierarchien
  - Interface Segregation: Kleine, spezifische Interfaces
  - Dependency Inversion: Abhängigkeit von Abstraktionen

- Namenskonventionen:

  - Klassennamen: PascalCase (z.B. `VideoTracker`)
  - Funktionen/Methoden: camelCase (z.B. `calculateProgress`)
  - Konstanten: UPPER_SNAKE_CASE (z.B. `DEFAULT_THRESHOLD`)
  - Private Eigenschaften: mit Unterstrich (z.B. `_lastUpdate`)
  - TypeScript Interfaces: mit "I" Prefix (z.B. `IVideoData`)

- Codestruktur:
  - Maximale Funktionslänge: 20 Zeilen
  - Maximale Klassenlänge: 200 Zeilen
  - Maximale Verschachtelungstiefe: 3 Level
  - Vermeidung von "Magic Numbers"
  - Frühe Returns statt verschachtelter If-Statements

### Test Driven Development

- Test-First Ansatz:

  - Rotes Stadium: Test schreiben
  - Grünes Stadium: Minimale Implementierung
  - Refactoring: Code verbessern

- Teststrategie:

  - Unit Tests für alle Services und Helper
  - Integration Tests für DOM-Manipulationen
  - End-to-End Tests für kritische User Flows
  - Mock-System für YouTube API Calls
  - Snapshots für UI-Komponenten

- Testabdeckung:
  - Minimum 80% Codeabdeckung
  - 100% Abdeckung für kritische Business-Logik
  - Mutation Testing für Testqualität

### Code Review Standards

- Checkliste für Reviews:

  - Clean Code Prinzipien eingehalten
  - Tests vorhanden und aussagekräftig
  - Dokumentation aktualisiert
  - Performance-Implikationen geprüft
  - Keine Sicherheitslücken

- Pull Request Guidelines:
  - Maximalgröße: 400 Zeilen
  - Aussagekräftige Beschreibung
  - Verknüpfung mit Issues
  - Changelog-Eintrag

### Dokumentationsstandards

- JSDoc für alle öffentlichen APIs:

  ```typescript
  /**
   * Berechnet den Fortschritt eines Videos.
   * @param {number} currentTime - Aktuelle Position in Sekunden
   * @param {number} duration - Gesamtlänge in Sekunden
   * @returns {number} Fortschritt in Prozent
   * @throws {InvalidTimeError} Wenn currentTime > duration
   */
  ```

- Architektur-Dokumentation:
  - Komponentendiagramme
  - Datenflussdiagramme
  - API-Dokumentation
  - Architectural Decision Records (ADRs)

### Performance Standards

- Metriken:

  - Time to Interactive: < 100ms
  - Memory Usage: < 50MB
  - CPU Usage: < 1% im Idle
  - Storage Usage: < 10MB pro 1000 Videos

- Optimierungen:
  - Virtualisierung für lange Listen
  - Lazy Loading für nicht sichtbare Komponenten
  - Debouncing für Event Handler
  - Caching von API-Responses
  - Web Worker für intensive Berechnungen

### Versionierung

- Semantic Versioning (MAJOR.MINOR.PATCH)
- Conventional Commits:
  ```
  feat: neue Funktion
  fix: Fehlerbehebung
  docs: Dokumentation
  refactor: Code-Verbesserung
  test: Test-Änderungen
  ```

### Kontinuierliche Integration

- Automatisierte Workflows:
  - Lint-Checks
  - Unit Tests
  - Integration Tests
  - Build-Prozess
  - Code Coverage Report
  - Bundle Size Analysis

## Entwicklungsphasen

### Phase 1: Grundfunktionalität
- Basis-Extension-Setup
- Einfache Erkennung von Video-Betrachtungen:
  - Positionsbasiertes Tracking für normale Videos
  - Fester Schwellenwert (50%)
- Grundlegende lokale Speicherung der Markierungen
- Minimales UI:
  - Einfache visuelle Markierung gesehener Videos
  - Basis-Einstellungsseite
- Grundlegende Entwicklungsinfrastruktur:
  - Build-System
  - Basic Testing
  - Logging-System

### Phase 2: Erweitertes Tracking & UI
- Implementierung verschiedener Tracking-Modi:
  - Zeitbasiertes Tracking
  - Separate Logik für Shorts und Previews
- Erweiterte UI-Funktionen:
  - Fortschrittsanzeige pro Video
  - Konfigurierbare Positionen und Formate
  - Manuelle Markierung/Demarkierung
- Ausblenden gesehener Videos:
  - Toggle-Funktionalität
  - Keyboard-Shortcuts
- Erweiterte Einstellungsmöglichkeiten:
  - Separate Schwellenwerte pro Videotyp
  - Anpassbare Visualisierungen

### Phase 3: Datenverwaltung & Cloud-Integration
- Implementierung der Cloud-Synchronisation:
  - OneDrive-Integration
  - Google Drive-Integration
  - Konfliktmanagement
- Export/Import-Funktionalität
- Watchlist-Verwaltung:
  - Tabellarische Übersicht
  - Such- und Filterfunktionen
- Erweitertes Datenmanagement:
  - Backup-System
  - Daten-Cleanup-Funktionen

### Phase 4: Optimierung & Erweiterungen
- Performance-Optimierungen:
  - Caching-System
  - Lazy Loading
  - Virtualisierung
- Erweiterte Funktionen:
  - YouTube-Verlauf-Integration
  - Erweiterte Statistiken
  - Batch-Operationen
- UI/UX-Verbesserungen:
  - Animationen
  - Responsiveness
  - Barrierefreiheit
- Erweiterte Tests:
  - E2E-Tests
  - Performance-Tests
  - Stress-Tests

### Phase 5: Polishing & Release
- Fehlerbehebung und Stabilisierung
- Dokumentation vervollständigen
- Performance-Feintuning
- Store-Release-Vorbereitungen:
  - Store-Listing
  - Screenshots
  - Marketingmaterial
- Community-Feedback-Integration

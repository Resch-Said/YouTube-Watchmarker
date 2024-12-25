# YouTube Watchmarker - Entwicklungs-Roadmap

## Phase 1: Grundfunktionalität (MVP) 🚀

**Status: In Entwicklung**

### Basis-Video-Tracking

- [x] Video-ID Extraktion
- [x] Wiedergabezeit-Tracking
- [x] Progress-Tracking
- [x] Basis-Einstellungen für Schwellenwerte
- [x] Lokale Speicherung der Watch-History

### Basis-UI

- [x] Popup mit grundlegenden Einstellungen
- [x] Grayscale-Effekt für gesehene Videos
- [x] "Watched"-Label Anzeige
- [x] Datum-Label Anzeige

## Phase 2: Erweiterte Video-Typen 🎥

**Status: In Arbeit**

### Shorts Integration

- [x] Separate Tracking-Logik für Shorts
- [x] Angepasste Schwellenwerte
- [x] Konfigurierbare Shorts-Einstellungen
- [ ] Verbesserte Shorts-spezifische UI

### Hover-Preview System

- [x] Hover-Event Detection
- [x] Preview-Video Tracking
- [x] Separate Hover-Einstellungen
- [ ] Performance-Optimierung für Hover-Handler
- [ ] Erweiterte Hover-UI-Konfiguration

## Phase 3: UI-Verbesserungen 🎨

**Status: Geplant**

### Erweiterte Einstellungen

- [ ] Tracking-Modus-Auswahl (Position/Zeit)
- [ ] Label-Positionierung
- [ ] Formatierungsoptionen für Labels
- [ ] Live-Vorschau für Einstellungen
- [ ] UND/ODER-Verknüpfungslogik für Tracking-Kriterien
- [ ] Separate Konfiguration für Video-Typen

### Visuelle Anpassungen

- [ ] Konfigurierbare Grayscale-Intensität
- [ ] Anpassbare Label-Stile
- [ ] Tooltip-System
- [ ] Fortschrittsanzeige während der Verarbeitung
- [ ] Konfigurierbare Position der Fortschrittsanzeige
- [ ] Anpassbare Zeitanzeige-Formate
- [ ] Anpassbare Prozentanzeige-Formate

### Ausblend-System

- [ ] Implementierung der Video-Entfernung
- [ ] Toggle-Funktion für temporäres Einblenden
- [ ] Keyboard-Shortcut-Integration
- [ ] Statistik-Tracking ausgeblendeter Videos
- [ ] Performance-Optimierung der DOM-Manipulation

## Phase 4: Datenverwaltung 💾

**Status: Geplant**

### Lokale Datenverwaltung

- [ ] Erweiterte Export-Funktionen
- [ ] Import-Validierung
- [ ] Backup-System
- [ ] Daten-Komprimierung
- [ ] Automatische Cache-Bereinigung
- [ ] Speicherplatz-Monitoring
- [ ] Daten-Migrationssystem

### Cloud-Integration

- [ ] OneDrive-Anbindung
- [ ] Google Drive-Anbindung
- [ ] Sync-Konfliktlösung
- [ ] Automatische Synchronisation

## Phase 5: Watchlist-System 📋

**Status: Geplant**

### Grundfunktionen

- [ ] Tabellarische Watchlist-Ansicht
- [ ] Basis-Sortierung
- [ ] Einfache Filterfunktion
- [ ] CSV/JSON Export
- [ ] YouTube-Verlauf Integration
- [ ] Automatische Erkennung gesehener Videos
- [ ] Periodische Überprüfung auf neue Videos

### Erweiterte Funktionen

- [ ] Erweiterte Sortieroptionen
- [ ] Komplexe Filterlogik
- [ ] Suchfunktion
- [ ] Bulk-Aktionen

## Phase 6: Performance & Optimierung ⚡

**Status: Geplant**

### Cache-System

- [ ] Implementierung des In-Memory-Cache
- [ ] Cache-Größenbegrenzung
- [ ] Intelligente Cache-Invalidierung
- [ ] Cache-Priorisierung

### Performance-Monitoring

- [ ] Logging-System
- [ ] Performance-Metriken
- [ ] Automatische Optimierung
- [ ] Debug-Modus
- [ ] Entwickler-Logging mit konfigurierbaren Levels
- [ ] Farbcodierte Konsolenausgaben
- [ ] Performance-Tracking kritischer Operationen
- [ ] Gruppierte Logs für zusammenhängende Vorgänge

## Phase 7: Finalisierung & Polishing ✨

**Status: Geplant**

### Qualitätssicherung

- [ ] Umfangreiche Tests
- [ ] Code-Dokumentation
- [ ] Benutzerhandbuch
- [ ] Performance-Audit

### Store-Vorbereitung

- [ ] Store-Listing vorbereiten
- [ ] Screenshots/Demos erstellen
- [ ] Datenschutzerklärung
- [ ] Support-Dokumentation

## Phase 8: Testing & Qualitätssicherung 🧪

**Status: Geplant**

### Test-Implementierung

- [ ] Unit Tests (80% Abdeckung)
- [ ] Integration Tests für DOM-Manipulationen
- [ ] End-to-End Tests für kritische Flows
- [ ] Mutation Testing
- [ ] Performance Tests

### Continuous Integration

- [ ] Automatisierte Test-Workflows
- [ ] Lint-Checks
- [ ] Code Coverage Reports
- [ ] Bundle Size Analysis
- [ ] Automatisierte Builds

## Legende

- ✅ Abgeschlossen
- 🔄 In Arbeit
- ⏳ Geplant
- ❌ Probleme/Blockiert

---

## Notizen & Updates

- **[2024-03-21]**: Initiale Roadmap erstellt
- **[2024-03-21]**: Phase 1 größtenteils abgeschlossen
- **[2024-03-21]**: Phase 2 in Bearbeitung

## Prioritäten-Matrix

### Sofort (Diese Woche)

- Hover-System Performance-Optimierung
- Memory-Leak in Hover-Handlern beheben
- Shorts-spezifische UI verbessern
- Basis-Implementation der Video-Entfernung

### Kurzfristig (Nächster Monat)

- UI-Verbesserungen aus Phase 3
- Basis-Watchlist-Funktionalität
- Erweiterte Einstellungsoptionen
- Performance-Optimierung der Video-Entfernung

### Mittelfristig (Q2 2024)

- Cloud-Integration
- Performance-Monitoring
- Cache-System

### Langfristig (2024)

- Erweiterte Watchlist-Funktionen
- Store-Veröffentlichung
- Internationalisierung

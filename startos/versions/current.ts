import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.3.0:0',
  releaseNotes: {
    en_US:
      'Updates StartOS Registry to 1.3.0. Older StartOS servers are offered only OS updates they can verify. Adds translated OS release notes, build-commit and security-update metadata, and compact index signatures with older-client compatibility. Configure Security Notifications lets registry operators opt in to OS security-update announcements; disabled by default, with a service restart when changed. Full release notes: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.3.0',
    es_ES:
      'Actualiza StartOS Registry a 1.3.0. A los servidores StartOS antiguos solo se les ofrecen actualizaciones del sistema que pueden verificar. Añade notas de versión del sistema traducidas, metadatos del commit de compilación y de actualizaciones de seguridad, y firmas compactas en el índice compatibles con clientes antiguos. Configurar notificaciones de seguridad permite activar los anuncios de actualizaciones de seguridad del sistema; están desactivados por defecto y cambiar el ajuste reinicia el servicio. Notas completas de la versión: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.3.0',
    de_DE:
      'Aktualisiert StartOS Registry auf 1.3.0. Älteren StartOS-Servern werden nur Betriebssystemupdates angeboten, die sie verifizieren können. Ergänzt übersetzte Betriebssystem-Versionshinweise, Metadaten zum Build-Commit und zu Sicherheitsupdates sowie kompakte Indexsignaturen mit Kompatibilität für ältere Clients. Über Sicherheitsbenachrichtigungen konfigurieren können Registry-Betreiber Ankündigungen von Betriebssystem-Sicherheitsupdates aktivieren; standardmäßig deaktiviert, eine Änderung startet den Dienst neu. Vollständige Versionshinweise: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.3.0',
    pl_PL:
      'Aktualizuje StartOS Registry do wersji 1.3.0. Starszym serwerom StartOS oferowane są tylko aktualizacje systemu, których podpisy mogą zweryfikować. Dodaje przetłumaczone informacje o wydaniach systemu, metadane commita kompilacji i aktualizacji bezpieczeństwa oraz zwarte podpisy indeksu zgodne ze starszymi klientami. Akcja Konfiguruj powiadomienia o bezpieczeństwie pozwala włączyć ogłoszenia o aktualizacjach bezpieczeństwa systemu; domyślnie są wyłączone, a zmiana ustawienia uruchamia usługę ponownie. Pełne informacje o wydaniu: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.3.0',
    fr_FR:
      'Met à jour StartOS Registry vers la version 1.3.0. Les anciens serveurs StartOS ne reçoivent que les mises à jour du système qu’ils peuvent vérifier. Ajoute les notes de version du système traduites, les métadonnées du commit de compilation et des mises à jour de sécurité, ainsi que des signatures d’index compactes compatibles avec les anciens clients. Configurer les notifications de sécurité permet d’activer les annonces de mises à jour de sécurité du système ; elles sont désactivées par défaut et modifier ce paramètre redémarre le service. Notes de version complètes : https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.3.0',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

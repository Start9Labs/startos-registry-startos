import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.2.1:0',
  releaseNotes: {
    en_US:
      'Updates StartOS Registry to 1.2.1. Fixes pure Ed25519 signatures being withheld from StartOS 0.4.0.3 servers, allowing them to install OS updates signed with GPG-held keys. Updates start-sdk to 3.1.1. Full release notes: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.2.1',
    es_ES:
      'Actualiza StartOS Registry a 1.2.1. Corrige la omisión de firmas Ed25519 puras para servidores StartOS 0.4.0.3, permitiéndoles instalar actualizaciones del sistema firmadas con claves gestionadas por GPG. Actualiza start-sdk a 3.1.1. Notas completas de la versión: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.2.1',
    de_DE:
      'Aktualisiert StartOS Registry auf 1.2.1. Behebt das Zurückhalten reiner Ed25519-Signaturen für StartOS-0.4.0.3-Server, sodass diese mit GPG-verwalteten Schlüsseln signierte Betriebssystemupdates installieren können. Aktualisiert start-sdk auf 3.1.1. Vollständige Versionshinweise: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.2.1',
    pl_PL:
      'Aktualizuje StartOS Registry do wersji 1.2.1. Naprawia pomijanie czystych podpisów Ed25519 dla serwerów StartOS 0.4.0.3, umożliwiając im instalowanie aktualizacji systemu podpisanych kluczami zarządzanymi przez GPG. Aktualizuje start-sdk do wersji 3.1.1. Pełne informacje o wydaniu: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.2.1',
    fr_FR:
      'Met à jour StartOS Registry vers la version 1.2.1. Corrige l’omission des signatures Ed25519 pures pour les serveurs StartOS 0.4.0.3, leur permettant d’installer les mises à jour du système signées avec des clés gérées par GPG. Met à jour start-sdk vers la version 3.1.1. Notes de version complètes : https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.2.1',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

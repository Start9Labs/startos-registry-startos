import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.1.0:0',
  releaseNotes: {
    en_US: `Updated StartOS Registry to 1.1.0.

- Registries can provide a localized Markdown description for display above their services in the marketplace.
- Clients can subscribe to live registry-index updates over WebSocket instead of repeatedly fetching the index.
- Package metadata now covers hardware virtualization and accurate upgrade paths. This release also fixes platform-specific OS asset removal and authentication for commands run on a registry host.

Full upstream changelog: https://github.com/Start9Labs/start-os/blob/master/projects/start-registry/CHANGELOG.md`,
    es_ES: `Actualiza StartOS Registry a 1.1.0.

- Los registros pueden proporcionar una descripción localizada en Markdown para mostrarla encima de sus servicios en el marketplace.
- Los clientes pueden suscribirse a actualizaciones en directo del índice del registro mediante WebSocket en lugar de solicitar el índice repetidamente.
- Los metadatos de los paquetes ahora incluyen la virtualización de hardware y rutas de actualización precisas. Esta versión también corrige la eliminación de recursos del sistema operativo por plataforma y la autenticación de los comandos ejecutados en el equipo del registro.

Registro de cambios completo: https://github.com/Start9Labs/start-os/blob/master/projects/start-registry/CHANGELOG.md`,
    de_DE: `Aktualisiert StartOS Registry auf 1.1.0.

- Registrys können eine lokalisierte Markdown-Beschreibung bereitstellen, die im Marketplace über ihren Diensten angezeigt wird.
- Clients können Registry-Index-Aktualisierungen live über WebSocket abonnieren, statt den Index wiederholt abzurufen.
- Paketmetadaten umfassen jetzt Hardware-Virtualisierung und korrekte Aktualisierungspfade. Diese Version behebt außerdem das Entfernen plattformspezifischer Betriebssystem-Assets und die Authentifizierung von Befehlen auf einem Registry-Host.

Vollständiges Änderungsprotokoll: https://github.com/Start9Labs/start-os/blob/master/projects/start-registry/CHANGELOG.md`,
    pl_PL: `Aktualizuje StartOS Registry do wersji 1.1.0.

- Rejestry mogą udostępniać zlokalizowany opis w formacie Markdown, wyświetlany nad ich serwisami w marketplace.
- Klienci mogą subskrybować aktualizacje indeksu rejestru na żywo przez WebSocket zamiast wielokrotnie pobierać indeks.
- Metadane pakietów obejmują teraz wirtualizację sprzętową i prawidłowe ścieżki aktualizacji. Ta wersja naprawia także usuwanie zasobów systemu operacyjnego dla wybranej platformy oraz uwierzytelnianie poleceń uruchamianych na hoście rejestru.

Pełna lista zmian: https://github.com/Start9Labs/start-os/blob/master/projects/start-registry/CHANGELOG.md`,
    fr_FR: `Met à jour StartOS Registry vers la version 1.1.0.

- Les registres peuvent fournir une description Markdown localisée, affichée au-dessus de leurs services dans la place de marché.
- Les clients peuvent s’abonner aux mises à jour en direct de l’index du registre par WebSocket au lieu de le récupérer à plusieurs reprises.
- Les métadonnées des paquets couvrent désormais la virtualisation matérielle et des chemins de mise à jour précis. Cette version corrige également la suppression des ressources du système d’exploitation par plateforme et l’authentification des commandes exécutées sur l’hôte du registre.

Journal des modifications complet : https://github.com/Start9Labs/start-os/blob/master/projects/start-registry/CHANGELOG.md`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

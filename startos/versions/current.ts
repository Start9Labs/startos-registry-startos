import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.1:0',
  releaseNotes: {
    en_US: `- Tracks the StartOS Registry server's new independent versioning (now 1.0.1).
- New request-signature authentication for admin and signer operations — managing this registry now requires start-cli 1.1.0 or newer.
- Package downloads stay compatible with StartOS clients older than 0.4.0-beta.10.`,
    es_ES: `- Sigue el nuevo versionado independiente del servidor de StartOS Registry (ahora 1.0.1).
- Nueva autenticación por firma de solicitud para las operaciones de administrador y firmante: gestionar este registro ahora requiere start-cli 1.1.0 o posterior.
- Las descargas de paquetes siguen siendo compatibles con clientes de StartOS anteriores a 0.4.0-beta.10.`,
    de_DE: `- Folgt der neuen unabhängigen Versionierung des StartOS-Registry-Servers (jetzt 1.0.1).
- Neue Authentifizierung per Anfragesignatur für Administrator- und Signierer-Vorgänge – die Verwaltung dieser Registry erfordert nun start-cli 1.1.0 oder neuer.
- Paket-Downloads bleiben mit StartOS-Clients älter als 0.4.0-beta.10 kompatibel.`,
    pl_PL: `- Śledzi nowe niezależne wersjonowanie serwera StartOS Registry (obecnie 1.0.1).
- Nowe uwierzytelnianie oparte na podpisie żądania dla operacji administratora i sygnatariusza — zarządzanie tym rejestrem wymaga teraz start-cli 1.1.0 lub nowszego.
- Pobieranie pakietów pozostaje zgodne z klientami StartOS starszymi niż 0.4.0-beta.10.`,
    fr_FR: `- Suit le nouveau versionnage indépendant du serveur StartOS Registry (désormais 1.0.1).
- Nouvelle authentification par signature de requête pour les opérations d'administrateur et de signataire — la gestion de ce registre nécessite désormais start-cli 1.1.0 ou une version plus récente.
- Les téléchargements de paquets restent compatibles avec les clients StartOS antérieurs à 0.4.0-beta.10.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

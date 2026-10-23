import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.2.0:0',
  releaseNotes: {
    en_US: `Updates StartOS Registry to 1.2.0. Package icons are deduplicated in a cacheable content-addressed store, signature labels distinguish Ed25519ph from pure Ed25519, and dependencies include security fixes. Existing icons and signatures migrate automatically on startup; older StartOS and start-cli clients remain compatible. Updates start-sdk to 3.1.0.

A reverse proxy in front of the registry must forward /icons/. If this registry serves StartWRT, set startwrt: true in config.yaml to retain compatible signature labels for routers.

Full release notes: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.2.0`,
    es_ES: `Actualiza StartOS Registry a 1.2.0. Los iconos de paquetes se deduplican en un almacén direccionado por contenido que admite caché, las etiquetas de firmas distinguen Ed25519ph de Ed25519 puro y las dependencias incluyen correcciones de seguridad. Los iconos y las firmas existentes migran automáticamente al arrancar; los clientes anteriores de StartOS y start-cli siguen siendo compatibles. Actualiza start-sdk a 3.1.0.

Un proxy inverso delante del registro debe reenviar /icons/. Si este registro sirve a StartWRT, establece startwrt: true en config.yaml para conservar etiquetas de firmas compatibles con los routers.

Notas completas de la versión: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.2.0`,
    de_DE: `Aktualisiert StartOS Registry auf 1.2.0. Paketsymbole werden in einem cachefähigen, inhaltsadressierten Speicher dedupliziert, Signaturkennungen unterscheiden Ed25519ph von reinem Ed25519 und Abhängigkeiten enthalten Sicherheitskorrekturen. Bestehende Symbole und Signaturen werden beim Start automatisch migriert; ältere StartOS- und start-cli-Clients bleiben kompatibel. Aktualisiert start-sdk auf 3.1.0.

Ein Reverse-Proxy vor der Registry muss /icons/ weiterleiten. Wenn diese Registry StartWRT versorgt, muss startwrt: true in config.yaml gesetzt werden, damit Router kompatible Signaturkennungen erhalten.

Vollständige Versionshinweise: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.2.0`,
    pl_PL: `Aktualizuje StartOS Registry do wersji 1.2.0. Ikony pakietów są deduplikowane w magazynie adresowanym zawartością z obsługą pamięci podręcznej, etykiety podpisów odróżniają Ed25519ph od czystego Ed25519, a zależności zawierają poprawki bezpieczeństwa. Istniejące ikony i podpisy migrują automatycznie przy uruchomieniu; starsze klienty StartOS i start-cli pozostają kompatybilne. Aktualizuje start-sdk do wersji 3.1.0.

Odwrotne proxy przed rejestrem musi przekazywać /icons/. Jeśli rejestr obsługuje StartWRT, ustaw startwrt: true w config.yaml, aby zachować etykiety podpisów zgodne z routerami.

Pełne informacje o wydaniu: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.2.0`,
    fr_FR: `Met à jour StartOS Registry vers la version 1.2.0. Les icônes de paquets sont dédupliquées dans un stockage adressé par contenu et compatible avec la mise en cache, les étiquettes de signatures distinguent Ed25519ph d’Ed25519 pur et les dépendances incluent des correctifs de sécurité. Les icônes et signatures existantes migrent automatiquement au démarrage ; les anciens clients StartOS et start-cli restent compatibles. Met à jour start-sdk vers la version 3.1.0.

Un proxy inverse devant le registre doit transmettre /icons/. Si ce registre dessert StartWRT, définissez startwrt: true dans config.yaml pour conserver des étiquettes de signatures compatibles avec les routeurs.

Notes de version complètes : https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.2.0`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

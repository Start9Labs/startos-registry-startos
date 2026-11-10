import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.5.0:0',
  releaseNotes: {
    en_US:
      'Updated StartOS Registry to 1.5.0. Opening a registry address in a browser redirects to the public Marketplace with that registry selected. OS version promotion preserves verified source signatures, and administrators can sign OS assets without a separate version-specific signer grant. CLI promotion accepts named registry profiles, and retained GPG exports can be removed without revoking signing keys or publishing permissions. Requires StartOS 0.4.2 or later. Full release notes: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.5.0',
    es_ES:
      'Actualiza StartOS Registry a 1.5.0. Abrir la dirección de un registro en el navegador redirige al Marketplace público con ese registro seleccionado. La promoción de versiones del sistema conserva las firmas de origen verificadas, y los administradores pueden firmar archivos del sistema sin un permiso de firmante específico para cada versión. La promoción mediante CLI acepta perfiles de registro con nombre y permite eliminar exportaciones GPG retenidas sin revocar las claves de firma ni los permisos de publicación. Requiere StartOS 0.4.2 o posterior. Notas completas de la versión: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.5.0',
    de_DE:
      'Aktualisiert StartOS Registry auf 1.5.0. Das Öffnen einer Registry-Adresse im Browser leitet zum öffentlichen Marketplace mit ausgewählter Registry weiter. Beim Übertragen von Betriebssystemversionen bleiben verifizierte Quellsignaturen erhalten; Administratoren können Betriebssystemdateien ohne separate versionsspezifische Signierberechtigung signieren. Die CLI unterstützt benannte Registry-Profile beim Übertragen; gespeicherte GPG-Exporte lassen sich ohne Entzug der Signierschlüssel oder Veröffentlichungsrechte entfernen. Erfordert StartOS 0.4.2 oder neuer. Vollständige Versionshinweise: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.5.0',
    pl_PL:
      'Aktualizuje StartOS Registry do wersji 1.5.0. Otwarcie adresu rejestru w przeglądarce przekierowuje do publicznego Marketplace z wybranym rejestrem. Przenoszenie wersji systemu zachowuje zweryfikowane podpisy źródłowe, a administratorzy mogą podpisywać pliki systemu bez osobnego uprawnienia sygnatariusza dla danej wersji. Przenoszenie przez CLI obsługuje nazwane profile rejestrów; zapisane eksporty GPG można usuwać bez odbierania kluczy podpisujących ani uprawnień do publikacji. Wymaga StartOS 0.4.2 lub nowszego. Pełne informacje o wydaniu: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.5.0',
    fr_FR:
      'Met à jour StartOS Registry vers la version 1.5.0. Ouvrir l’adresse d’un registre dans un navigateur redirige vers le Marketplace public avec ce registre sélectionné. La promotion de versions du système conserve les signatures sources vérifiées, et les administrateurs peuvent signer les fichiers système sans autorisation de signataire propre à chaque version. La promotion par CLI accepte les profils de registre nommés ; les exports GPG conservés peuvent être supprimés sans révoquer les clés de signature ni les droits de publication. Nécessite StartOS 0.4.2 ou ultérieur. Notes de version complètes : https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.5.0',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})

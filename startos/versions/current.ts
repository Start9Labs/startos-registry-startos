import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.1.0:4',
  releaseNotes: {
    en_US:
      'The public key error in Add Administrator is now shown in your language.',
    es_ES:
      'El error de clave pública en Añadir Administrador ahora se muestra en tu idioma.',
    de_DE:
      'Der Fehler zum öffentlichen Schlüssel in „Administrator hinzufügen“ wird jetzt in deiner Sprache angezeigt.',
    pl_PL:
      'Błąd klucza publicznego w Dodaj Administratora jest teraz wyświetlany w twoim języku.',
    fr_FR:
      'L’erreur de clé publique dans Ajouter un Administrateur s’affiche désormais dans votre langue.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

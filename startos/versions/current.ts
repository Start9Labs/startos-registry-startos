import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.4.0:2',
  releaseNotes: {
    en_US:
      'Manage Signers can add, replace, or clear existing public keys without recreating signers or losing their permissions. Removes the incorrect warning that keys cannot be changed.',
    es_ES:
      'Gestionar firmantes permite añadir, sustituir o borrar claves públicas existentes sin recrear firmantes ni perder sus permisos. Elimina la advertencia incorrecta que indicaba que las claves no podían cambiarse.',
    de_DE:
      'Unterzeichner verwalten kann bestehende öffentliche Schlüssel ohne neue Unterzeichner oder Verlust ihrer Berechtigungen hinzufügen, ersetzen oder leeren. Entfernt den falschen Hinweis, Schlüssel könnten nicht geändert werden.',
    pl_PL:
      'Zarządzaj sygnatariuszami pozwala dodawać, zastępować i usuwać istniejące klucze publiczne bez tworzenia sygnatariuszy od nowa ani utraty uprawnień. Usuwa błędne ostrzeżenie, że kluczy nie można zmieniać.',
    fr_FR:
      'Gérer les signataires permet d’ajouter, remplacer ou effacer les clés publiques existantes sans recréer les signataires ni perdre leurs autorisations. Supprime l’avertissement incorrect indiquant que les clés ne peuvent pas être modifiées.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})

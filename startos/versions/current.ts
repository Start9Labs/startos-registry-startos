import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.6.0:1',
  releaseNotes: {
    en_US:
      'Manage Signers accepts a PEM public key pasted on a single line, and asks for an armored GPG key pasted without its line breaks to be pasted again with them.',
    es_ES:
      'Gestionar firmantes acepta una clave pública PEM pegada en una sola línea y pide volver a pegar con sus saltos de línea una clave GPG armada pegada sin ellos.',
    de_DE:
      'Unterzeichner verwalten akzeptiert einen in einer einzigen Zeile eingefügten öffentlichen PEM-Schlüssel und verlangt, einen ohne Zeilenumbrüche eingefügten ASCII-armierten GPG-Schlüssel mit ihnen erneut einzufügen.',
    pl_PL:
      'Zarządzaj sygnatariuszami przyjmuje klucz publiczny PEM wklejony w jednym wierszu, a gdy klucz GPG w formacie armored zostanie wklejony bez podziałów wierszy, prosi o ponowne wklejenie go z nimi.',
    fr_FR:
      'Gérer les signataires accepte une clé publique PEM collée sur une seule ligne et demande de recoller avec ses sauts de ligne une clé GPG armurée collée sans eux.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})

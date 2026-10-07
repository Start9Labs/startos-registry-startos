import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.1.0:5',
  releaseNotes: {
    en_US: `The public key error in Add Administrator is now shown in your language.

- Remove Administrator starts with no administrator selected.
- Add Administrator and Remove Administrator explain their fields, including where to find an administrator's public key.
- List Packages shows one package name per line.`,
    es_ES: `El error de clave pública en Añadir Administrador ahora se muestra en tu idioma.

- Eliminar Administrador empieza sin ningún administrador seleccionado.
- Añadir Administrador y Eliminar Administrador explican sus campos, incluido dónde encontrar la clave pública de un administrador.
- Listar Paquetes muestra un nombre de paquete por línea.`,
    de_DE: `Der Fehler zum öffentlichen Schlüssel in „Administrator hinzufügen“ wird jetzt in deiner Sprache angezeigt.

- „Administrator entfernen“ beginnt ohne ausgewählten Administrator.
- „Administrator hinzufügen“ und „Administrator entfernen“ erklären ihre Felder, auch wo der öffentliche Schlüssel eines Administrators zu finden ist.
- „Pakete auflisten“ zeigt einen Paketnamen pro Zeile.`,
    pl_PL: `Błąd klucza publicznego w Dodaj Administratora jest teraz wyświetlany w twoim języku.

- Usuń Administratora zaczyna bez wybranego administratora.
- Dodaj Administratora i Usuń Administratora objaśniają swoje pola, w tym gdzie znaleźć klucz publiczny administratora.
- Lista Pakietów pokazuje jedną nazwę pakietu w wierszu.`,
    fr_FR: `L’erreur de clé publique dans Ajouter un Administrateur s’affiche désormais dans votre langue.

- Supprimer un Administrateur commence sans administrateur sélectionné.
- Ajouter un Administrateur et Supprimer un Administrateur expliquent leurs champs, y compris où trouver la clé publique d’un administrateur.
- Lister les Paquets affiche un nom de paquet par ligne.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

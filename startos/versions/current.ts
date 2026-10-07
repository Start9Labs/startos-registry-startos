import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.1.1:0',
  releaseNotes: {
    en_US: `Updates StartOS Registry to 1.1.1. Clients see only the package revisions they need while every revision stays indexed, a registry's icon and description can be cleared, admin requests are accepted at any loopback address, and shared dependencies carry their latest security fixes. Full release notes: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.1.1

- Remove Administrator starts with no administrator selected.
- Add Administrator and Remove Administrator explain their fields, including where to find an administrator's public key.
- List Packages shows one package name per line.`,
    es_ES: `Actualiza StartOS Registry a 1.1.1. Los clientes solo ven las revisiones de paquetes que necesitan mientras todas las revisiones siguen indexadas, el icono y la descripción de un registro se pueden borrar, las solicitudes de administración se aceptan en cualquier dirección de loopback y las dependencias compartidas incluyen sus últimas correcciones de seguridad. Notas completas de la versión: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.1.1

- Eliminar Administrador empieza sin ningún administrador seleccionado.
- Añadir Administrador y Eliminar Administrador explican sus campos, incluido dónde encontrar la clave pública de un administrador.
- Listar Paquetes muestra un nombre de paquete por línea.`,
    de_DE: `Aktualisiert StartOS Registry auf 1.1.1. Clients sehen nur die Paketrevisionen, die sie brauchen, während alle Revisionen indexiert bleiben, Symbol und Beschreibung einer Registry lassen sich entfernen, Admin-Anfragen werden an jeder Loopback-Adresse angenommen und gemeinsam genutzte Abhängigkeiten enthalten ihre neuesten Sicherheitskorrekturen. Vollständige Versionshinweise: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.1.1

- „Administrator entfernen“ beginnt ohne ausgewählten Administrator.
- „Administrator hinzufügen“ und „Administrator entfernen“ erklären ihre Felder, auch wo der öffentliche Schlüssel eines Administrators zu finden ist.
- „Pakete auflisten“ zeigt einen Paketnamen pro Zeile.`,
    pl_PL: `Aktualizuje StartOS Registry do wersji 1.1.1. Klienci widzą tylko potrzebne im rewizje pakietów, a wszystkie rewizje pozostają w indeksie, ikonę i opis rejestru można usunąć, żądania administracyjne są przyjmowane pod dowolnym adresem pętli zwrotnej, a współdzielone zależności zawierają najnowsze poprawki bezpieczeństwa. Pełne informacje o wydaniu: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.1.1

- Usuń Administratora zaczyna bez wybranego administratora.
- Dodaj Administratora i Usuń Administratora objaśniają swoje pola, w tym gdzie znaleźć klucz publiczny administratora.
- Lista Pakietów pokazuje jedną nazwę pakietu w wierszu.`,
    fr_FR: `Met à jour StartOS Registry vers la version 1.1.1. Les clients ne voient que les révisions de paquets dont ils ont besoin tandis que toutes les révisions restent indexées, l’icône et la description d’un registre peuvent être effacées, les requêtes d’administration sont acceptées sur n’importe quelle adresse de bouclage et les dépendances partagées intègrent leurs derniers correctifs de sécurité. Notes de version complètes : https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.1.1

- Supprimer un Administrateur commence sans administrateur sélectionné.
- Ajouter un Administrateur et Supprimer un Administrateur expliquent leurs champs, y compris où trouver la clé publique d’un administrateur.
- Lister les Paquets affiche un nom de paquet par ligne.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

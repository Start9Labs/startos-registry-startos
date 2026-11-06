import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { configYaml } from '../fileModels/config.yaml'
import { registriesJson } from '../fileModels/registries.json'
import { apiPort, defaultRegistryId } from '../utils'

export const current = VersionInfo.of({
  version: '1.4.0:1',
  releaseNotes: {
    en_US:
      'Run multiple independent registries, each with its own addresses, packages, settings, and signers. Manage Registries creates named registries with automatic internal IDs and restores disabled entries without deleting their data. All actions identify registries by name; only Manage Registries edits names. Manage Signers replaces the administrator actions with named collapsible sections so several registries can be edited in one submission, supporting GPG public keys, Admin permissions, and Offer for Trust. The existing registry keeps its data and addresses. Configure Registry can clear the icon and description. Package-list results include the selected registry name and count, and CLI-backed actions direct users to enable a registry when none are enabled. Removes Configure Security Notifications and disables existing OS security announcements. Requires StartOS 0.4.1 or later.',
    es_ES:
      'Ejecuta varios registros independientes, cada uno con sus propias direcciones, paquetes, ajustes y firmantes. Gestionar registros crea registros con nombre e identificadores internos automáticos y restaura entradas deshabilitadas sin borrar sus datos. Todas las acciones identifican los registros por nombre; solo Gestionar registros permite editar los nombres. Gestionar firmantes sustituye las acciones de administradores por secciones plegables con nombre para editar varios registros en un solo envío, con claves públicas GPG, permisos de administrador y la opción de ofrecer confianza. El registro existente conserva sus datos y direcciones. Configurar registro permite borrar el icono y la descripción. La lista de paquetes incluye el nombre del registro seleccionado y la cantidad; si no hay registros habilitados, las acciones basadas en CLI indican que se debe habilitar uno. Elimina la acción Configurar notificaciones de seguridad y desactiva los anuncios de seguridad del sistema existentes. Requiere StartOS 0.4.1 o posterior.',
    de_DE:
      'Mehrere unabhängige Registries mit eigenen Adressen, Paketen, Einstellungen und Unterzeichnern betreiben. Registries verwalten erstellt benannte Registries mit automatischen internen IDs und stellt deaktivierte Einträge ohne Datenverlust wieder her. Alle Aktionen zeigen Registry-Namen; nur Registries verwalten bearbeitet die Namen. Unterzeichner verwalten ersetzt die Administratoraktionen durch benannte einklappbare Abschnitte zum gemeinsamen Bearbeiten mehrerer Registries und unterstützt öffentliche GPG-Schlüssel, Administratorrechte und Vertrauensangebote. Die bestehende Registry behält ihre Daten und Adressen. Registry konfigurieren kann Symbol und Beschreibung löschen. Paketlisten nennen die ausgewählte Registry und die Anzahl; wenn keine Registry aktiviert ist, verweisen CLI-basierte Aktionen auf die Aktivierung einer Registry. Entfernt die Aktion Sicherheitsbenachrichtigungen konfigurieren und deaktiviert bestehende Betriebssystem-Sicherheitsankündigungen. Erfordert StartOS 0.4.1 oder neuer.',
    pl_PL:
      'Uruchamiaj wiele niezależnych rejestrów z własnymi adresami, pakietami, ustawieniami i sygnatariuszami. Zarządzaj rejestrami tworzy nazwane rejestry z automatycznymi identyfikatorami wewnętrznymi i przywraca wyłączone wpisy bez kasowania danych. Wszystkie akcje pokazują nazwy rejestrów; tylko Zarządzaj rejestrami zmienia nazwy. Zarządzaj sygnatariuszami zastępuje akcje administratorów nazwanymi zwijanymi sekcjami do edycji wielu rejestrów w jednym zgłoszeniu i obsługuje publiczne klucze GPG, uprawnienia administratora oraz proponowanie zaufania. Istniejący rejestr zachowuje dane i adresy. Konfiguracja rejestru pozwala wyczyścić ikonę i opis. Wyniki listy pakietów zawierają nazwę wybranego rejestru i liczbę pakietów; gdy wszystkie rejestry są wyłączone, akcje oparte na CLI wskazują, aby włączyć rejestr. Usuwa akcję Konfiguruj powiadomienia o bezpieczeństwie i wyłącza istniejące ogłoszenia o aktualizacjach bezpieczeństwa systemu. Wymaga StartOS 0.4.1 lub nowszego.',
    fr_FR:
      'Exécutez plusieurs registres indépendants, chacun avec ses propres adresses, paquets, paramètres et signataires. Gérer les registres crée des registres nommés avec des identifiants internes automatiques et restaure les entrées désactivées sans supprimer leurs données. Toutes les actions affichent les noms des registres ; seul Gérer les registres modifie les noms. Gérer les signataires remplace les actions des administrateurs par des sections nommées repliables pour modifier plusieurs registres en un seul envoi, avec les clés publiques GPG, les droits administrateur et les propositions de confiance. Le registre existant conserve ses données et adresses. Configurer le registre permet de vider l’icône et la description. Les résultats de la liste de paquets indiquent le registre choisi et le nombre de paquets ; si aucun registre n’est activé, les actions utilisant la CLI invitent à en activer un. Supprime l’action Configurer les notifications de sécurité et désactive les annonces de sécurité du système existantes. Nécessite StartOS 0.4.1 ou ultérieur.',
  },
  migrations: {
    up: async ({ effects }) => {
      await sdk.action.clearTask(effects, 'startos-registry:add-admin')
      await sdk.action.clearTask(effects, 'startos-registry:config')
      const registries = (await registriesJson
        .read((s) => s.registries)
        .once()) ?? [{ id: defaultRegistryId, port: apiPort }]
      for (const registry of registries) {
        const config = configYaml(registry)
        if (await config.read().once()) {
          await config.merge(effects, { 'security-notifications': undefined })
        }
      }
    },
    down: IMPOSSIBLE,
  },
})

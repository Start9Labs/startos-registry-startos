import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '1.4.0:1',
  releaseNotes: {
    en_US:
      'Run multiple independent registries, each with its own addresses, packages, settings, and signers. Manage Registries adds or removes registries without deleting their data. Manage Signers replaces the administrator actions and supports GPG public keys, Admin permissions, and Offer for Trust. The existing registry keeps its data and addresses as default. Configure Registry can clear the icon and description. Removes Configure Security Notifications. Requires StartOS 0.4.1 or later.',
    es_ES:
      'Ejecuta varios registros independientes, cada uno con sus propias direcciones, paquetes, ajustes y firmantes. Gestionar registros permite añadirlos o quitarlos sin borrar sus datos. Gestionar firmantes sustituye las acciones de administradores y admite claves públicas GPG, permisos de administrador y la opción de ofrecer confianza. El registro existente conserva sus datos y direcciones como default. Configurar registro permite borrar el icono y la descripción. Elimina la acción Configurar notificaciones de seguridad. Requiere StartOS 0.4.1 o posterior.',
    de_DE:
      'Mehrere unabhängige Registries mit eigenen Adressen, Paketen, Einstellungen und Unterzeichnern betreiben. Registries verwalten fügt Registries hinzu oder entfernt sie, ohne ihre Daten zu löschen. Unterzeichner verwalten ersetzt die Administratoraktionen und unterstützt öffentliche GPG-Schlüssel, Administratorrechte und Vertrauensangebote. Die bestehende Registry behält ihre Daten und Adressen als default. Registry konfigurieren kann Symbol und Beschreibung löschen. Entfernt die Aktion Sicherheitsbenachrichtigungen konfigurieren. Erfordert StartOS 0.4.1 oder neuer.',
    pl_PL:
      'Uruchamiaj wiele niezależnych rejestrów z własnymi adresami, pakietami, ustawieniami i sygnatariuszami. Zarządzaj rejestrami dodaje lub usuwa rejestry bez kasowania danych. Zarządzaj sygnatariuszami zastępuje akcje administratorów i obsługuje publiczne klucze GPG, uprawnienia administratora oraz proponowanie zaufania. Istniejący rejestr zachowuje dane i adresy jako default. Konfiguracja rejestru pozwala wyczyścić ikonę i opis. Usuwa akcję Konfiguruj powiadomienia o bezpieczeństwie. Wymaga StartOS 0.4.1 lub nowszego.',
    fr_FR:
      'Exécutez plusieurs registres indépendants, chacun avec ses propres adresses, paquets, paramètres et signataires. Gérer les registres permet de les ajouter ou de les retirer sans supprimer leurs données. Gérer les signataires remplace les actions des administrateurs et prend en charge les clés publiques GPG, les droits administrateur et les propositions de confiance. Le registre existant conserve ses données et adresses sous default. Configurer le registre permet de vider l’icône et la description. Supprime l’action Configurer les notifications de sécurité. Nécessite StartOS 0.4.1 ou ultérieur.',
  },
  migrations: {
    up: async ({ effects }) => {
      await sdk.action.clearTask(effects, 'startos-registry:add-admin')
    },
    down: IMPOSSIBLE,
  },
})

import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.1.0:1',
  releaseNotes: {
    en_US: `Configure Registry can set a description for the registry. It appears above the registry's services in the marketplace and may use markdown.

The listing's upstream and project links now point at the start-technologies repository, where StartOS Registry lives.`,
    es_ES: `Configurar Registro puede establecer una descripción para el registro. Aparece encima de los servicios del registro en el marketplace y admite Markdown.

Los enlaces al proyecto y al repositorio original de la ficha apuntan ahora al repositorio start-technologies, donde vive StartOS Registry.`,
    de_DE: `Registry konfigurieren kann eine Beschreibung für die Registry festlegen. Sie erscheint im Marketplace über den Diensten der Registry und darf Markdown verwenden.

Die Links zum Projekt und zum Upstream-Repository in der Paketübersicht führen jetzt zum Repository start-technologies, in dem StartOS Registry liegt.`,
    pl_PL: `Skonfiguruj rejestr może ustawić opis rejestru. Jest wyświetlany w marketplace nad serwisami rejestru i może używać Markdown.

Linki do projektu i repozytorium źródłowego na karcie pakietu prowadzą teraz do repozytorium start-technologies, w którym znajduje się StartOS Registry.`,
    fr_FR: `Configurer le registre peut définir une description du registre. Elle apparaît au-dessus des services du registre dans le marketplace et peut utiliser le Markdown.

Les liens vers le projet et le dépôt d’origine de la fiche pointent désormais vers le dépôt start-technologies, où se trouve StartOS Registry.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

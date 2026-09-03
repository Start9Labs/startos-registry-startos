import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.1:4',
  releaseNotes: {
    en_US: `Configure Registry can set a description for the registry. It appears above the registry's services in the marketplace and may use markdown.`,
    es_ES: `Configurar Registro puede establecer una descripción para el registro. Aparece encima de los servicios del registro en el marketplace y admite Markdown.`,
    de_DE: `Registry konfigurieren kann eine Beschreibung für die Registry festlegen. Sie erscheint im Marketplace über den Diensten der Registry und darf Markdown verwenden.`,
    pl_PL: `Skonfiguruj rejestr może ustawić opis rejestru. Jest wyświetlany w marketplace nad serwisami rejestru i może używać Markdown.`,
    fr_FR: `Configurer le registre peut définir une description du registre. Elle apparaît au-dessus des services du registre dans le marketplace et peut utiliser le Markdown.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.1.0:1',
  releaseNotes: {
    en_US: `Points the listing's upstream and project links at the start-technologies repository, where StartOS Registry now lives. Nothing changes in normal operation.`,
    es_ES: `Los enlaces al proyecto y al repositorio original de la ficha apuntan ahora al repositorio start-technologies, donde vive StartOS Registry. En funcionamiento normal no cambia nada.`,
    de_DE: `Die Links zum Projekt und zum Upstream-Repository in der Paketübersicht führen jetzt zum Repository start-technologies, in dem StartOS Registry heute liegt. Im laufenden Betrieb ändert sich nichts.`,
    pl_PL: `Linki do projektu i repozytorium źródłowego na karcie pakietu prowadzą teraz do repozytorium start-technologies, w którym znajduje się StartOS Registry. W normalnym działaniu nic się nie zmienia.`,
    fr_FR: `Les liens vers le projet et le dépôt d’origine de la fiche pointent désormais vers le dépôt start-technologies, où se trouve StartOS Registry. Rien ne change en fonctionnement normal.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

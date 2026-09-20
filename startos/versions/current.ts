import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.1.0:2',
  releaseNotes: {
    en_US: `A new List Packages action shows how many packages your registry hosts and lists their names.

Configure Registry accepts SVG icons for the Registry Icon.`,
    es_ES: `Una nueva acción Listar Paquetes muestra cuántos paquetes aloja tu registro y enumera sus nombres.

Configurar Registro acepta iconos SVG como Icono del Registro.`,
    de_DE: `Eine neue Aktion „Pakete auflisten“ zeigt, wie viele Pakete deine Registry hostet, und listet ihre Namen auf.

„Registry konfigurieren“ akzeptiert SVG-Symbole als Registry-Symbol.`,
    pl_PL: `Nowa akcja Lista Pakietów pokazuje, ile pakietów hostuje twój rejestr, i wymienia ich nazwy.

Konfiguruj Rejestr przyjmuje ikony SVG jako Ikonę Rejestru.`,
    fr_FR: `Une nouvelle action Lister les Paquets indique combien de paquets votre registre héberge et en donne les noms.

Configurer le Registre accepte les icônes SVG comme Icône du Registre.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

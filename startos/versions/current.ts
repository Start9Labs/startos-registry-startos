import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.1:3',
  releaseNotes: {
    en_US: `Fixes StartOS Registry failing to start.

StartOS Registry wrote its Tor proxy setting as a bare host and port, but the server reads that setting as a full address, so it exited immediately on startup and the Configure Registry and Add Administrator setup actions failed. The setting is now written as a complete address, so the service starts and both setup actions work.`,
    es_ES: `Corrige el fallo de arranque de StartOS Registry.

StartOS Registry escribía su ajuste de proxy Tor como un host y un puerto sueltos, pero el servidor lee ese ajuste como una dirección completa, por lo que se cerraba nada más arrancar y fallaban las acciones de configuración Configurar registro y Añadir administrador. Ahora el ajuste se escribe como una dirección completa, de modo que el servicio arranca y ambas acciones funcionan.`,
    de_DE: `Behebt den Startfehler von StartOS Registry.

StartOS Registry schrieb seine Tor-Proxy-Einstellung als reinen Host mit Port, der Server liest diese Einstellung jedoch als vollständige Adresse. Dadurch beendete er sich sofort beim Start und die Einrichtungsaktionen „Registry konfigurieren“ und „Administrator hinzufügen“ schlugen fehl. Die Einstellung wird jetzt als vollständige Adresse geschrieben, sodass der Dienst startet und beide Aktionen funktionieren.`,
    pl_PL: `Naprawia błąd uruchamiania StartOS Registry.

StartOS Registry zapisywał ustawienie serwera proxy Tor jako sam host z portem, natomiast serwer odczytuje to ustawienie jako pełny adres. Z tego powodu kończył pracę zaraz po starcie, a akcje konfiguracyjne „Skonfiguruj rejestr” i „Dodaj administratora” kończyły się błędem. Ustawienie jest teraz zapisywane jako pełny adres, dzięki czemu usługa się uruchamia, a obie akcje działają.`,
    fr_FR: `Corrige l'échec de démarrage de StartOS Registry.

StartOS Registry écrivait son paramètre de proxy Tor sous forme d'hôte et de port seuls, alors que le serveur lit ce paramètre comme une adresse complète : il s'arrêtait donc dès le démarrage et les actions de configuration « Configurer le registre » et « Ajouter un administrateur » échouaient. Le paramètre est désormais écrit sous forme d'adresse complète, de sorte que le service démarre et que les deux actions fonctionnent.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

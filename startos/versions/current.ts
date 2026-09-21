import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.1.0:3',
  releaseNotes: {
    en_US:
      'Adding or removing an address on the Web API interface now restarts the registry, so the change takes effect at once.',
    es_ES:
      'Añadir o quitar una dirección en la interfaz API Web ahora reinicia el registro, de modo que el cambio surte efecto de inmediato.',
    de_DE:
      'Das Hinzufügen oder Entfernen einer Adresse an der Schnittstelle Web-API startet die Registry jetzt neu, sodass die Änderung sofort wirksam wird.',
    pl_PL:
      'Dodanie lub usunięcie adresu w interfejsie API Web powoduje teraz ponowne uruchomienie rejestru, dzięki czemu zmiana działa od razu.',
    fr_FR:
      'Ajouter ou retirer une adresse sur l’interface API Web redémarre désormais le registre, afin que le changement prenne effet immédiatement.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

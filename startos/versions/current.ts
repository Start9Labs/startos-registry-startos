import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.1.0:3',
  releaseNotes: {
    en_US:
      'Adding or removing an address on the Web API interface now restarts the registry, so the change takes effect at once. Before, administrator and signer requests sent to a newly added address were rejected with an invalid signature error until the service was restarted by hand.',
    es_ES:
      'Añadir o quitar una dirección en la interfaz API Web ahora reinicia el registro, de modo que el cambio surte efecto de inmediato. Antes, las solicitudes de administradores y firmantes enviadas a una dirección recién añadida se rechazaban con un error de firma no válida hasta que el servicio se reiniciaba manualmente.',
    de_DE:
      'Das Hinzufügen oder Entfernen einer Adresse an der Schnittstelle Web-API startet die Registry jetzt neu, sodass die Änderung sofort wirksam wird. Zuvor wurden Anfragen von Administratoren und Signierern an eine neu hinzugefügte Adresse mit einem Fehler wegen ungültiger Signatur abgelehnt, bis der Dienst von Hand neu gestartet wurde.',
    pl_PL:
      'Dodanie lub usunięcie adresu w interfejsie API Web powoduje teraz ponowne uruchomienie rejestru, dzięki czemu zmiana działa od razu. Wcześniej żądania administratorów i podpisujących wysyłane na nowo dodany adres były odrzucane z błędem nieprawidłowego podpisu, dopóki usługa nie została ręcznie uruchomiona ponownie.',
    fr_FR:
      'Ajouter ou retirer une adresse sur l’interface API Web redémarre désormais le registre, afin que le changement prenne effet immédiatement. Auparavant, les requêtes des administrateurs et des signataires envoyées à une adresse nouvellement ajoutée étaient rejetées avec une erreur de signature invalide jusqu’à ce que le service soit redémarré manuellement.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

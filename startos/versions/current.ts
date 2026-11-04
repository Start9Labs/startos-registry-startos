import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.4.0:0',
  releaseNotes: {
    en_US:
      'Updates StartOS Registry to 1.4.0. Registered signers can co-sign indexed packages without re-uploading them. Package publishing, mirroring, and promotion accept verified endorsements; re-adding a package with another key retains its signature. Registry trust proposals preserve selected signer identities and complete GPG public-key information. Full release notes: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.4.0',
    es_ES:
      'Actualiza StartOS Registry a 1.4.0. Los firmantes registrados pueden añadir su firma a paquetes indexados sin volver a subirlos. La publicación, la adición de espejos y la promoción de paquetes aceptan firmas adicionales verificadas; volver a añadir un paquete con otra clave conserva su firma. Las propuestas de confianza del registro conservan las identidades de los firmantes seleccionados y toda la información de sus claves públicas GPG. Notas completas de la versión: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.4.0',
    de_DE:
      'Aktualisiert StartOS Registry auf 1.4.0. Registrierte Unterzeichner können indexierte Pakete ohne erneutes Hochladen mitunterzeichnen. Veröffentlichung, Spiegelung und Übernahme von Paketen akzeptieren verifizierte Zusatzsignaturen; beim erneuten Hinzufügen mit einem anderen Schlüssel bleibt dessen Signatur erhalten. Vertrauensvorschläge der Registry bewahren die ausgewählten Unterzeichneridentitäten und die vollständigen öffentlichen GPG-Schlüsselinformationen. Vollständige Versionshinweise: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.4.0',
    pl_PL:
      'Aktualizuje StartOS Registry do wersji 1.4.0. Zarejestrowani sygnatariusze mogą podpisywać pakiety w indeksie bez ich ponownego przesyłania. Publikowanie, dodawanie serwerów lustrzanych i przenoszenie pakietów między rejestrami akceptują zweryfikowane dodatkowe podpisy; ponowne dodanie pakietu innym kluczem zachowuje jego podpis. Propozycje zaufania rejestru zachowują tożsamości wybranych sygnatariuszy i pełne informacje o ich kluczach publicznych GPG. Pełne informacje o wydaniu: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.4.0',
    fr_FR:
      'Met à jour StartOS Registry vers la version 1.4.0. Les signataires enregistrés peuvent cosigner les paquets indexés sans les téléverser à nouveau. La publication, l’ajout de miroirs et la promotion des paquets acceptent les signatures supplémentaires vérifiées ; ajouter à nouveau un paquet avec une autre clé conserve sa signature. Les propositions de confiance du registre préservent les identités des signataires sélectionnés et toutes les informations de leurs clés publiques GPG. Notes de version complètes : https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.4.0',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

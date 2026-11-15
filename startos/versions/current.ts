import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.6.0:0',
  releaseNotes: {
    en_US:
      'Updated StartOS Registry to 1.6.0. Administrators can make packages private, visible only to admins, publishers and chosen signers, using start-cli. OS release notes and security flags can be edited without republishing. Publishing an OS version no longer takes a headline; use an updated start-cli. Requests are limited to 1 MiB, so a registry icon given as an image data URL must stay under that size. Full release notes: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.6.0',
    es_ES:
      'Actualiza StartOS Registry a 1.6.0. Los administradores pueden hacer privados los paquetes, visibles solo para administradores, publicadores y firmantes elegidos, mediante start-cli. Las notas de versión y el indicador de seguridad del sistema se pueden editar sin volver a publicar. Publicar una versión del sistema ya no requiere un titular; use un start-cli actualizado. Las solicitudes están limitadas a 1 MiB, por lo que un icono de registro dado como URL de datos de imagen debe quedar por debajo de ese tamaño. Notas completas de la versión: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.6.0',
    de_DE:
      'Aktualisiert StartOS Registry auf 1.6.0. Administratoren können Pakete mit start-cli privat machen, sichtbar nur für Administratoren, Herausgeber und ausgewählte Unterzeichner. Versionshinweise und Sicherheitskennzeichen von Betriebssystemversionen lassen sich ohne erneute Veröffentlichung bearbeiten. Das Veröffentlichen einer Betriebssystemversion benötigt keine Überschrift mehr; verwenden Sie ein aktuelles start-cli. Anfragen sind auf 1 MiB begrenzt, daher muss ein als Bild-Data-URL angegebenes Registry-Symbol kleiner bleiben. Vollständige Versionshinweise: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.6.0',
    pl_PL:
      'Aktualizuje StartOS Registry do wersji 1.6.0. Administratorzy mogą za pomocą start-cli ustawić pakiety jako prywatne, widoczne tylko dla administratorów, publikujących i wybranych sygnatariuszy. Informacje o wydaniu i oznaczenie bezpieczeństwa wersji systemu można edytować bez ponownej publikacji. Publikowanie wersji systemu nie wymaga już nagłówka; użyj zaktualizowanego start-cli. Żądania są ograniczone do 1 MiB, więc ikona rejestru podana jako adres URL danych obrazu musi mieścić się w tym rozmiarze. Pełne informacje o wydaniu: https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.6.0',
    fr_FR:
      'Met à jour StartOS Registry vers la version 1.6.0. Les administrateurs peuvent rendre des paquets privés, visibles uniquement par les administrateurs, les éditeurs et les signataires choisis, avec start-cli. Les notes de version et l’indicateur de sécurité des versions du système peuvent être modifiés sans republication. Publier une version du système ne demande plus de titre ; utilisez un start-cli à jour. Les requêtes sont limitées à 1 Mio : une icône de registre fournie sous forme d’URL de données d’image doit rester sous cette taille. Notes de version complètes : https://github.com/Start9Labs/start-technologies/releases/tag/start-registry%2Fv1.6.0',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})

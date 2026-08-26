import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.2:0',
  releaseNotes: {
    en_US: `Updated StartOS Registry to 1.0.2.

- A package version published to your registry now advertises which installed versions can upgrade into it, so a client asking for an upgrade path is offered a version it can actually install. Entries already in the index keep their old value until that version is published again.
- Removing a single platform's OS asset works from the command line: \`os asset remove iso|img|squashfs <version> <platform>\` now takes the version and platform instead of rejecting them, so dropping one platform no longer means removing the whole version and re-adding the rest.
- Registry commands run on the registry host now authenticate correctly when the registry listens on a wildcard address, which is how StartOS runs it. Previously such commands could come back "Unauthorized".

Full upstream changelog: https://github.com/Start9Labs/start-os/blob/master/projects/start-registry/CHANGELOG.md`,
    es_ES: `Actualiza StartOS Registry a 1.0.2.

- Una versión de paquete publicada en tu registro ahora indica qué versiones instaladas pueden actualizarse a ella, de modo que un cliente que pide una ruta de actualización recibe una versión que realmente puede instalar. Las entradas ya presentes en el índice conservan su valor anterior hasta que esa versión se vuelva a publicar.
- Eliminar el recurso de sistema operativo de una sola plataforma funciona desde la línea de comandos: \`os asset remove iso|img|squashfs <versión> <plataforma>\` ahora acepta la versión y la plataforma en lugar de rechazarlas, así que quitar una plataforma ya no obliga a eliminar la versión entera y volver a añadir el resto.
- Los comandos del registro ejecutados en el propio equipo del registro ahora se autentican correctamente cuando el registro escucha en una dirección comodín, que es como lo ejecuta StartOS. Antes esos comandos podían devolver «Unauthorized».

Registro de cambios completo: https://github.com/Start9Labs/start-os/blob/master/projects/start-registry/CHANGELOG.md`,
    de_DE: `Aktualisiert StartOS Registry auf 1.0.2.

- Eine in Ihrer Registry veröffentlichte Paketversion gibt jetzt an, aus welchen installierten Versionen auf sie aktualisiert werden kann, sodass einem Client, der nach einem Aktualisierungspfad fragt, eine tatsächlich installierbare Version angeboten wird. Bereits im Index vorhandene Einträge behalten ihren alten Wert, bis die Version erneut veröffentlicht wird.
- Das Entfernen des Betriebssystem-Assets einer einzelnen Plattform funktioniert über die Kommandozeile: \`os asset remove iso|img|squashfs <Version> <Plattform>\` nimmt Version und Plattform jetzt entgegen, statt sie abzulehnen. Eine Plattform zu entfernen erfordert also nicht mehr, die ganze Version zu löschen und alle übrigen neu hinzuzufügen.
- Registry-Befehle, die auf dem Registry-Host laufen, authentifizieren sich jetzt korrekt, wenn die Registry auf einer Wildcard-Adresse lauscht — so startet StartOS sie. Zuvor konnten solche Befehle mit „Unauthorized“ fehlschlagen.

Vollständiges Änderungsprotokoll: https://github.com/Start9Labs/start-os/blob/master/projects/start-registry/CHANGELOG.md`,
    pl_PL: `Aktualizuje StartOS Registry do wersji 1.0.2.

- Wersja pakietu opublikowana w Twoim rejestrze wskazuje teraz, z których zainstalowanych wersji można na nią zaktualizować, dzięki czemu klient pytający o ścieżkę aktualizacji otrzymuje wersję, którą faktycznie da się zainstalować. Wpisy już obecne w indeksie zachowują dotychczasową wartość do czasu ponownej publikacji danej wersji.
- Usuwanie zasobu systemu operacyjnego dla pojedynczej platformy działa z wiersza poleceń: \`os asset remove iso|img|squashfs <wersja> <platforma>\` przyjmuje teraz wersję i platformę zamiast je odrzucać, więc usunięcie jednej platformy nie wymaga już skasowania całej wersji i dodania pozostałych od nowa.
- Polecenia rejestru uruchamiane na hoście rejestru uwierzytelniają się teraz poprawnie, gdy rejestr nasłuchuje na adresie uniwersalnym, czyli tak, jak uruchamia go StartOS. Wcześniej takie polecenia mogły kończyć się błędem „Unauthorized”.

Pełna lista zmian: https://github.com/Start9Labs/start-os/blob/master/projects/start-registry/CHANGELOG.md`,
    fr_FR: `Met à jour StartOS Registry vers 1.0.2.

- Une version de paquet publiée dans votre registre indique désormais depuis quelles versions installées on peut mettre à jour vers elle, si bien qu'un client demandant un chemin de mise à jour se voit proposer une version réellement installable. Les entrées déjà présentes dans l'index conservent leur ancienne valeur jusqu'à la republication de cette version.
- La suppression de la ressource système d'une seule plateforme fonctionne en ligne de commande : \`os asset remove iso|img|squashfs <version> <plateforme>\` accepte maintenant la version et la plateforme au lieu de les rejeter, si bien que retirer une plateforme n'oblige plus à supprimer la version entière puis à rajouter toutes les autres.
- Les commandes du registre exécutées sur l'hôte du registre s'authentifient désormais correctement lorsque le registre écoute sur une adresse générique, ce qui est le mode de fonctionnement sous StartOS. Auparavant, ces commandes pouvaient répondre « Unauthorized ».

Journal des modifications complet : https://github.com/Start9Labs/start-os/blob/master/projects/start-registry/CHANGELOG.md`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

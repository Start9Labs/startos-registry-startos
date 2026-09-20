import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.1.0:2',
  releaseNotes: {
    en_US:
      'Configure Registry now accepts SVG icons. The Registry Icon field rejected any data URL whose image type contains a plus sign, a period, or a digit, which ruled out image/svg+xml and image/vnd.microsoft.icon. PNG, JPEG, and http(s) URL icons work as before.',
    es_ES:
      'Configurar Registro acepta ahora iconos SVG. El campo Icono del Registro rechazaba cualquier URL de datos cuyo tipo de imagen contuviera un signo más, un punto o un dígito, lo que excluía image/svg+xml e image/vnd.microsoft.icon. Los iconos PNG, JPEG y los indicados mediante una URL http(s) funcionan como antes.',
    de_DE:
      '„Registry konfigurieren“ akzeptiert jetzt SVG-Symbole. Das Feld „Registry-Symbol“ lehnte jede Daten-URL ab, deren Bildtyp ein Pluszeichen, einen Punkt oder eine Ziffer enthält, was image/svg+xml und image/vnd.microsoft.icon ausschloss. PNG-, JPEG- und per http(s)-URL angegebene Symbole funktionieren wie bisher.',
    pl_PL:
      'Akcja „Konfiguruj Rejestr” przyjmuje teraz ikony SVG. Pole „Ikona Rejestru” odrzucało każdy URL danych, którego typ obrazu zawiera znak plus, kropkę lub cyfrę, co wykluczało image/svg+xml oraz image/vnd.microsoft.icon. Ikony PNG, JPEG oraz podane jako URL http(s) działają jak dotychczas.',
    fr_FR:
      'Configurer le Registre accepte désormais les icônes SVG. Le champ Icône du Registre refusait toute URL de données dont le type d’image contient un signe plus, un point ou un chiffre, ce qui excluait image/svg+xml et image/vnd.microsoft.icon. Les icônes PNG, JPEG et celles indiquées par une URL http(s) fonctionnent comme avant.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

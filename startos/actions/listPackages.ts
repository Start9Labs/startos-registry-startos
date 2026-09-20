import { ExtendedVersion } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// the slice of `start-registry package index` this action reads
type PackageIndex = {
  packages: Record<string, { versions: Record<string, { title: string }> }>
}

export const listPackages = sdk.Action.withoutInput(
  // id
  'list-packages',

  // metadata
  async ({ effects }) => ({
    name: i18n('List Packages'),
    description: i18n('Show the names of the packages hosted on this registry'),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  // the execution function
  async ({ effects }) => {
    const { packages } = await sdk.SubContainer.withTemp<PackageIndex>(
      effects,
      { imageId: 'startos-registry', sharedRun: true },
      null,
      'list-packages',
      async (sub) =>
        JSON.parse(
          (
            await sub.execFail([
              'start-registry',
              'package',
              'index',
              '--format=json',
            ])
          ).stdout as string,
        ),
    )

    const titles = Object.values(packages)
      .map(({ versions }) => newestTitle(versions))
      .filter((title): title is string => title !== null)
      .sort((a, b) => a.localeCompare(b))

    if (!titles.length) {
      return {
        version: '1',
        title: i18n('Hosted Packages'),
        message: i18n('No packages are hosted on this registry yet.'),
        result: null,
      }
    }

    return {
      version: '1',
      title: i18n('Packages hosted: ${count}', { count: titles.length }),
      // the StartOS alert renders this as HTML
      message: titles.map(escapeHtml).join(', '),
      result: null,
    }
  },
)

function newestTitle(
  versions: Record<string, { title: string }>,
): string | null {
  const [newest] = Object.entries(versions)
    .map(([version, { title }]) => ({
      parsed: ExtendedVersion.parse(version),
      title,
    }))
    .sort((a, b) => b.parsed.compareForSort(a.parsed))
  return newest?.title ?? null
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

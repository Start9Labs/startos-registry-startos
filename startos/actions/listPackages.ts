import { ExtendedVersion } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { registryCli } from '../utils'
import { registrySelect, selectedRegistry } from '../fileModels/registries.json'

// the slice of `start-registry package index` this action reads
type PackageIndex = {
  packages: Record<string, { versions: Record<string, { title: string }> }>
}

export const listPackages = sdk.Action.withInput(
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

  sdk.InputSpec.of({ registry: registrySelect }),
  async () => null,

  // the execution function
  async ({ effects, input }) => {
    const registry = await selectedRegistry(input.registry)
    const { packages }: PackageIndex = JSON.parse(
      (
        await registryCli(effects, registry, [
          'package',
          'index',
          '--format=json',
        ])
      ).stdout as string,
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
      message: null,
      result: {
        type: 'multiline',
        value: titles.join('\n'),
        copyable: true,
        qr: false,
        masked: false,
        filename: null,
      },
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

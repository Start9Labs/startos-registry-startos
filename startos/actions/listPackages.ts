import { ExtendedVersion, T } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { registryCli, registryAvailabilityDescription } from '../utils'
import { registrySelect, selectedRegistry } from '../fileModels/registries.json'

// the slice of `start-registry package index` this action reads
type PackageIndex = {
  packages: Record<string, { versions: Record<string, { title: string }> }>
}

export const listPackages = sdk.Action.withInput(
  // id
  'list-packages',

  // metadata
  async () => ({
    name: i18n('List Packages'),
    description:
      i18n('List package titles and a count for a selected registry.') +
      ' ' +
      registryAvailabilityDescription(),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  sdk.InputSpec.of({ registry: registrySelect }),
  async () => null,

  // the execution function
  async ({ effects, input, spec }) => {
    const selected = await selectedRegistry(input.registry)
    const name = (spec.registry as T.inputSpecTypes.ValueSpecSelect).values[
      input.registry
    ]
    const registry = { ...selected, name }
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

    const title = i18n('Packages in ${registry}: ${count}', {
      registry: name,
      count: titles.length,
    })
    if (!titles.length) {
      return {
        version: '1',
        title,
        message: i18n('The selected registry’s catalog is empty.'),
        result: null,
      }
    }

    return {
      version: '1',
      title,
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

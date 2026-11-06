export const DEFAULT_LANG = 'en_US'

const dict = {
  'Could not resolve the imported GPG signing keys. Reopen the action and try again.': 96,
  '${registry}: ${message}': 91,
  '${registry} / ${signer}: ${message}': 92,
  'Signer row ${position}': 93,
  'Updates can partially apply if a CLI command fails. Reopen the action to inspect current state before retrying.': 94,
  'All enabled registries must be available.': 95,
  // main.ts
  'Starting StartOS Registry!': 0,
  'Web API': 1,
  'API port listening — ${registry}': 2,
  'API port not listening — ${registry}': 3,

  // interfaces.ts
  'Use this API address with start-cli to publish packages or add it as a registry source on another StartOS server.': 4,
  'Web API — ${registry}': 66,

  // actions/config.ts
  'Configure Registry': 5,
  'Set the icon and description of a selected registry.': 6,
  'Registry Icon': 8,
  'Enter a base64 image data URL or an HTTP(S) URL.': 9,
  'Registry Description': 24,
  'Shown above the selected registry’s packages in the marketplace. Markdown is supported. Leave blank to clear the description in all languages.': 25,
  'Use a base64 image data URL or an HTTP(S) URL. Leave blank to clear the selected registry’s icon.': 90,

  // actions/manageSigners.ts
  Label: 12,
  'Public Keys': 18,
  Admin: 50,
  'Allow this signer to administer this section’s registry.': 51,
  'Offer for Trust': 52,
  'Offer this signer’s public keys to clients of this section’s registry. This does not grant administrator rights.': 53,
  'Manage Signers': 55,
  'Every signer needs a nonblank label.': 64,
  Signers: 69,
  Contacts: 70,
  'On submission, removing a signer deletes its authorizations from this section’s registry. Unchecking Admin keeps the signer. All registry sections are submitted together.': 71,
  'Add or replace active signing keys with PEM public keys or complete armored GPG exports for supported Ed25519 keys. New signers need a key. Clearing an existing signer’s keys revokes its access without deleting its permissions. Never enter private keys.': 72,
  'Edit signers, administrator rights, and trust offers across enabled registries.': 73,
  'Signers changed while this form was open. Reopen it and try again.': 74,
  'Each existing signer must appear only once per registry section.': 75,
  'Remove empty contact rows or enter an email address, Matrix username, or contact URL.': 77,
  'Enter an email address, Matrix username, or contact URL.': 78,
  'Each new signer needs at least one public key.': 79,
  'Optional email addresses, Matrix usernames, or contact URLs.': 87,
  'Must be a PEM public key or an armored GPG public-key export.': 49,

  // actions/listPackages.ts
  'List Packages': 26,
  'List package titles and a count for a selected registry.': 27,
  'Packages in ${registry}: ${count}': 29,
  'The selected registry’s catalog is empty.': 30,

  // init/adminTasks.ts
  'Set up signers and administrator rights for enabled registries.': 23,
  'Name the initial registry.': 86,
  'Manage Registries': 39,
  'Create, name, enable, or disable independent registries.': 40,
  Registries: 41,
  'Registry Name': 7,
  'Registry configuration is missing. Rebuild the service and try again.': 46,
  'No ports remain for another registry.': 47,
  Registry: 67,
  'The selected registry is no longer enabled. Reopen the action and choose an enabled registry.': 68,
  'Unnamed Registry': 80,
  'Use a registry name of 1–32 characters.': 81,
  'Changes apply on submission. Disabling a registry stops it and hides its interface without deleting data. Removing a row also disables it; the retained entry reappears when this action is reopened. Enable an entry to restore it.': 82,
  Enabled: 83,
  'Registries changed while this form was open. Reopen it and try again.': 84,
  'Registry names must be unique, including disabled entries. Enable a disabled entry to restore it.': 85,
  'Choose an enabled registry. Enable or restore registries in Manage Registries.': 88,
  'No registries are enabled. Open Manage Registries and enable a registry before using this action.': 89,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict

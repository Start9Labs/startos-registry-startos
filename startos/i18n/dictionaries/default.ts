export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting StartOS Registry!': 0,
  'Web API': 1,
  'The web API is ready': 2,
  'The API is unreachable': 3,

  // interfaces.ts
  'The web API of your custom registry.': 4,

  // actions/config.ts
  'Configure Registry': 5,
  'Set the name, icon, and description of your registry': 6,
  'Registry Name': 7,
  'Registry Icon': 8,
  'Must be a valid data URL or http(s) URL (e.g. data:image/png;base64,abc123... or https://example.com/icon.png)': 9,
  'Registry Description': 24,
  'Shown above your services in the marketplace. Markdown is supported.': 25,

  // actions/addAdmin.ts
  'Add Administrator': 10,
  'Add an admin to this registry': 11,
  Label: 12,
  Contact: 13,
  Email: 14,
  Matrix: 15,
  Username: 16,
  'Must be a valid matrix username (e.g. @user:domain.com)': 17,
  'Public Key': 18,
  'Must be a valid PEM encoded public key': 31,
  'Identifies this administrator in the Remove Administrator list.': 33,
  'How to reach this administrator. It is saved with their key on this registry.\n- Email: reach them at an email address\n- Matrix: reach them at a Matrix username': 34,
  "The administrator's start-cli identity key in PEM form, as printed by start-cli pubkey on their workstation. Whoever holds the matching private key can administer this registry.": 35,

  // actions/removeAdmin.ts
  'Remove Administrator': 19,
  'Remove an administrator from this registry': 20,
  Administrator: 21,
  'Removing an administrator also removes every authorization their key holds on this registry. Once the last one is removed, no key can administer the registry.': 32,

  // actions/listPackages.ts
  'List Packages': 26,
  'Show the names of the packages hosted on this registry': 27,
  'Hosted Packages': 28,
  'Packages hosted: ${count}': 29,
  'No packages are hosted on this registry yet.': 30,

  // init/adminTasks.ts
  'Set basic information about your registry': 22,
  'Add an administrator to your registry': 23,
  'Manage Registries': 39,
  'Add or remove independent registries, each with its own addresses and signers.': 40,
  Registries: 41,
  'Removing a registry stops it and hides its interface. Its data and address settings are retained; add the same ID to restore it.': 42,
  'Registry ID': 43,
  'A permanent identifier, such as stable or beta. Changing it creates a different registry.': 44,
  'Use 1–32 lowercase letters, digits, or single hyphens, starting with a letter and ending with a letter or digit.': 45,
  'Registry configuration is missing. Rebuild the service and try again.': 46,
  'No ports remain for another registry.': 47,
  'Paste a PEM public key from start-cli pubkey or a complete armored GPG public-key export. Never enter a private key.': 48,
  'Must be a PEM public key or an armored GPG public-key export.': 49,
  Admin: 50,
  'Grant permission to administer this registry.': 51,
  'Offer for Trust': 52,
  'Offer this signer’s public keys to connecting StartOS servers. This does not grant administrator rights.': 53,
  'An email address, Matrix username, or contact URL.': 54,
  'Manage Signers': 55,
  'Add, edit, or remove signers and control administrator rights and trust offers.': 56,
  Operation: 57,
  'Add Signer': 58,
  'Edit Signer': 59,
  Signer: 60,
  'Remove Signer': 61,
  'Removing a signer deletes all its authorizations. Revoking Admin alone keeps the signer. Local StartOS actions can restore an administrator.': 62,
  'A label and contact are required.': 63,
  'A label is required.': 64,
  'Web API — ${registry}': 66,
  Registry: 67,
  'This registry is no longer enabled. Reopen the action and try again.': 68,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict

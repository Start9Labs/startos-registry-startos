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
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict

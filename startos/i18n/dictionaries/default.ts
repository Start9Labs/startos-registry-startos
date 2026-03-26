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
  'Set the name, icon, and categories of your registry': 6,
  'Registry Name': 7,
  'Registry Icon': 8,
  'Must be a valid data URL (e.g. data:image/png;base64,abc123...)': 9,

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

  // actions/removeAdmin.ts
  'Remove Administrator': 19,
  'Remove an administrator from this registry': 20,
  Users: 21,

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

/** Map API icon string keys → Material Icons glyph names */
const ICON_MAP = {
  raccoon: 'pets',
  map: 'map',
  megaphone: 'campaign',
  tag: 'sell',
  fire: 'local_fire_department',
  flag: 'flag',
  coin: 'monetization_on',
  moneta: 'monetization_on',
  treasure: 'diamond',
  key: 'vpn_key',
  lock: 'lock',
  clock: 'schedule',
  night: 'nightlight',
  star: 'star',
  sword: 'sports_martial_arts',
  versus: 'sports_kabaddi',
  coop: 'groups',
  scroll: 'description',
  puzzle: 'extension',
  eye: 'visibility',
  whisper: 'hearing',
  camp: 'cabin',
  forest: 'park',
  sunglasses: 'visibility',
  bottle: 'liquor',
  finish: 'emoji_events',
  mic: 'mic',
  spiral: 'blur_on',
  portrait: 'portrait',
  hat: 'checkroom',
  moose: 'pets',
  bet: 'casino',
  stick: 'sports_martial_arts',
  tree: 'park',
  bribe: 'volunteer_activism',
  target: 'gps_fixed',
  can: 'recycling',
  flower: 'local_florist',
  cards: 'style',
  beer: 'sports_bar',
  default: 'help_outline'
}

export function graIconName (key) {
  if (!key) return ICON_MAP.default
  const k = String(key).trim().toLowerCase()
  return ICON_MAP[k] || ICON_MAP.default
}

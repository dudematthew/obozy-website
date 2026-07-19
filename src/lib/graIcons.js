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
  // festival batch 26+
  water: 'water_drop',
  note: 'sticky_note_2',
  dance: 'nightlife',
  walk: 'directions_walk',
  shoe: 'hiking',
  worm: 'bug_report',
  camera: 'photo_camera',
  guest: 'person_add',
  host: 'record_voice_over',
  ink: 'brush',
  cipher: 'password',
  potato: 'restaurant',
  chess: 'grid_on',
  wheelbarrow: 'agriculture',
  egg: 'egg_alt',
  river: 'waves',
  default: 'help_outline'
}

/** Known API keys (for host form hints). */
export const GRA_ICON_KEYS = Object.keys(ICON_MAP)
  .filter((k) => k !== 'default')
  .sort()

export function graIconName (key) {
  if (!key) return ICON_MAP.default
  const k = String(key).trim().toLowerCase()
  return ICON_MAP[k] || ICON_MAP.default
}

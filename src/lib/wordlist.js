/**
 * Word list for three-word key generation
 */

// Common English words - easy to remember and type
const WORD_LIST = [
  // Nature words
  'lily', 'rose', 'tulip', 'iris', 'fern', 'moss', 'vine', 'tree', 'leaf', 'bloom',
  'daisy', 'ivy', 'oak', 'elm', 'ash', 'pine', 'reed', 'rush', 'herb', 'thyme',
  'mint', 'sage', 'basil', 'flax', 'hemp', 'jute', 'reed', 'cane', 'wheat', 'corn',

  // Animal words
  'cat', 'dog', 'bird', 'fish', 'bear', 'wolf', 'fox', 'hawk', 'owl', 'swan',
  'duck', 'goose', 'crane', 'heron', 'stork', 'crow', 'raven', 'dove', 'lark', 'wren',
  'finch', 'robin', 'swift', 'shark', 'whale', 'dolphin', 'otter', 'beaver', 'rabbit', 'hare',
  'mouse', 'rat', 'ferret', 'weasel', 'mink', 'sable', 'tiger', 'lion', 'leopard', 'cheetah',
  'panther', 'lynx', 'bobcat', 'coyote', 'jackal', 'hyena', 'badger', 'skunk', 'raccoon', 'opossum',

  // Color words
  'yellow', 'blue', 'red', 'green', 'purple', 'orange', 'pink', 'brown', 'black', 'white',
  'gray', 'silver', 'gold', 'bronze', 'crimson', 'scarlet', 'violet', 'indigo', 'azure', 'cyan',
  'magenta', 'amber', 'ochre', 'umber', 'sepia', 'pearl', 'ivory', 'ebony', 'jet', 'onyx',

  // Element words
  'stone', 'rock', 'sand', 'dust', 'clay', 'mud', 'earth', 'soil', 'dirt', 'gravel',
  'pebble', 'boulder', 'slate', 'marble', 'granite', 'quartz', 'flint', 'chalk', 'coal', 'iron',
  'steel', 'brass', 'copper', 'bronze', 'silver', 'golden', 'metal', 'alloy', 'rust', 'tarnish',

  // Sky and weather words
  'cloud', 'rain', 'snow', 'wind', 'storm', 'breeze', 'gale', 'mist', 'fog', 'haze',
  'frost', 'dew', 'ice', 'hail', 'sleet', 'thunder', 'lightning', 'rainbow', 'sunset', 'sunrise',
  'dawn', 'dusk', 'twilight', 'midnight', 'noon', 'midday', 'moon', 'sun', 'star', 'sky',

  // Water words
  'river', 'stream', 'brook', 'creek', 'lake', 'pond', 'pool', 'sea', 'ocean', 'wave',
  'tide', 'surf', 'spray', 'foam', 'bubble', 'ripple', 'splash', 'drip', 'drop', 'trickle',
  'flow', 'current', 'eddy', 'whirl', 'swirl', 'flood', 'deluge', 'torrent', 'cascade', 'waterfall',

  // Time words
  'moment', 'second', 'minute', 'hour', 'day', 'night', 'week', 'month', 'year', 'decade',
  'spring', 'summer', 'autumn', 'winter', 'season', 'past', 'present', 'future', 'history', 'tomorrow',

  // Movement words
  'walk', 'run', 'jump', 'hop', 'skip', 'leap', 'dance', 'spin', 'turn', 'twist',
  'fly', 'soar', 'glide', 'float', 'drift', 'swim', 'dive', 'plunge', 'sink', 'rise',
  'climb', 'fall', 'drop', 'roll', 'slide', 'slip', 'stumble', 'trip', 'stumble', 'catch'
];

/**
 * Generate a random three-word key
 * @returns {string} - A three-word key like "yellow-lily-flies"
 */
export function generateRandomKey() {
  const words = [];

  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    words.push(WORD_LIST[randomIndex]);
  }

  return words.join('-');
}

/**
 * Generate a random three-word key with options
 * @param {Object} options - Configuration options
 * @param {string[]} options.exclude - Words to exclude from generation
 * @returns {string} - A three-word key
 */
export function generateRandomKeyWithOptions(options = {}) {
  const { exclude = [] } = options;

  const availableWords = WORD_LIST.filter(word => !exclude.includes(word));

  if (availableWords.length < 3) {
    return generateRandomKey();
  }

  const words = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    words.push(availableWords[randomIndex]);
  }

  return words.join('-');
}

/**
 * Get the word list
 * @returns {string[]} - The complete word list
 */
export function getWordList() {
  return [...WORD_LIST];
}

/**
 * Check if a word is in our word list
 * @param {string} word - Word to check
 * @returns {boolean} - Whether the word is valid
 */
export function isValidWord(word) {
  return WORD_LIST.includes(word.toLowerCase());
}

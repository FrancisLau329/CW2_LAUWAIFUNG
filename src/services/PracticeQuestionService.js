class PracticeQuestionService {
  constructor() {
    this.soundAlikeDatabase = this.buildSoundAlikeDatabase();
  }

  // Build sound-alike words database
  buildSoundAlikeDatabase() {
    return {
      // Animal sound-alike words
      'cat': ['bat', 'hat', 'rat', 'mat'],
      'dog': ['log', 'fog', 'hog', 'jog'],
      'bird': ['word', 'heard', 'third', 'herd'],
      'fish': ['wish', 'dish', 'rich', 'which'],
      'horse': ['force', 'course', 'source', 'norse'],

      // Food sound-alike words
      'apple': ['chapel', 'grapple', 'ripple', 'dapple'],
      'bread': ['red', 'bed', 'head', 'read'],
      'orange': ['range', 'strange', 'change', 'arrange'],
      'banana': ['cabana', 'bandana', 'piano', 'drama'],
      'food': ['mood', 'good', 'wood', 'hood'],

      // Transportation sound-alike words
      'car': ['bar', 'far', 'star', 'jar'],
      'bus': ['plus', 'thus', 'dust', 'must'],
      'bicycle': ['circle', 'purple', 'triple', 'simple'],
      'truck': ['duck', 'luck', 'stuck', 'buck'],
      'plane': ['rain', 'train', 'brain', 'drain'],

      // Technology products sound-alike words
      'phone': ['bone', 'tone', 'zone', 'loan'],
      'computer': ['commuter', 'recruiter', 'tutor', 'suitor'],
      'keyboard': ['aboard', 'cardboard', 'dashboard', 'onboard'],
      'smartphone': ['smartbone', 'hearttone', 'cartphone', 'smartphone'],
      'television': ['revision', 'division', 'provision', 'decision'],

      // Furniture sound-alike words
      'chair': ['hair', 'pair', 'care', 'share'],
      'table': ['able', 'stable', 'cable', 'fable'],
      'bed': ['red', 'head', 'bread', 'thread'],
      'cup': ['up', 'pup', 'cut', 'but'],
      'bottle': ['battle', 'rattle', 'cattle', 'settle'],

      // Architecture sound-alike words
      'house': ['mouse', 'spouse', 'blouse', 'grouse'],
      'building': ['gilding', 'yielding', 'shielding', 'wielding'],
      'window': ['bingo', 'tango', 'mango', 'lingo'],
      'door': ['more', 'four', 'floor', 'poor'],

      // Nature sound-alike words
      'tree': ['free', 'three', 'sea', 'bee'],
      'flower': ['power', 'tower', 'shower', 'hour'],
      'water': ['daughter', 'quarter', 'slaughter', 'matter'],
      'sun': ['run', 'fun', 'gun', 'one'],
      'cloud': ['loud', 'proud', 'crowd', 'allowed'],

      // People sound-alike words
      'person': ['prison', 'poison', 'reason', 'season'],
      'man': ['can', 'pan', 'ran', 'tan'],
      'woman': ['human', 'roman', 'lemon', 'common'],
      'child': ['wild', 'mild', 'build', 'guild'],

      // Clothing sound-alike words
      'shirt': ['dirt', 'hurt', 'court', 'short'],
      'shoes': ['choose', 'news', 'blues', 'cruise'],
      'hat': ['cat', 'bat', 'rat', 'flat'],

      // Daily items sound-alike words
      'book': ['look', 'cook', 'took', 'hook'],
      'pen': ['ten', 'when', 'den', 'then'],
      'paper': ['taper', 'vapor', 'caper', 'draper'],

      // More common words sound-alike words
      'microphone': ['saxophone', 'telephone', 'xylophone', 'gramophone'],
      'keyboard': ['seaboard', 'cardboard', 'dashboard', 'motherboard'],
      'mouse': ['house', 'spouse', 'blouse', 'grouse'],
      'screen': ['green', 'clean', 'scene', 'queen'],
      'speaker': ['weaker', 'seeker', 'bleaker', 'sneaker'],
      'camera': ['drama', 'llama', 'comma', 'mama'],
      'laptop': ['desktop', 'hilltop', 'rooftop', 'tabletop'],
      'monitor': ['janitor', 'editor', 'auditor', 'solicitor']
    };
  }

  // Generate similar sounding word options
  generateSimilarSoundingWords(targetWord, count = 3) {
    const targetLower = targetWord?.toLowerCase() || 'word';
    
    // If there are predefined sound-alike words, use them
    if (this.soundAlikeDatabase[targetLower]) {
      const similarWords = this.soundAlikeDatabase[targetLower];
      // Randomly select specified number of words
      const shuffled = this.shuffleArray([...similarWords]);
      return shuffled.slice(0, count);
    }
    
    // If no predefined words, generate phonetically similar words
    const phoneticSimilar = this.generatePhoneticSimilar(targetWord, count);
    return phoneticSimilar;
  }

  // Generate phonetically similar words
  generatePhoneticSimilar(word, count = 3) {
    const wordLower = word?.toLowerCase() || 'word';
    
    // Group by word ending sounds
    const rhymeGroups = {
      // -ing ending
      'ing': ['ring', 'sing', 'king', 'wing', 'thing', 'bring', 'spring', 'string'],
      // -ack ending
      'ack': ['back', 'pack', 'track', 'crack', 'black', 'stack', 'attack', 'snack'],
      // -ent ending
      'ent': ['tent', 'rent', 'sent', 'went', 'bent', 'spent', 'event', 'recent'],
      // -ine ending
      'ine': ['line', 'mine', 'wine', 'shine', 'fine', 'pine', 'divine', 'design'],
      // -ock ending
      'ock': ['rock', 'clock', 'block', 'shock', 'knock', 'stock', 'unlock', 'o\'clock'],
      // -all ending
      'all': ['ball', 'call', 'fall', 'wall', 'small', 'tall', 'recall', 'overall'],
      // -ight ending
      'ight': ['light', 'right', 'night', 'bright', 'sight', 'flight', 'height', 'delight'],
      // -ound ending
      'ound': ['sound', 'round', 'found', 'ground', 'bound', 'pound', 'around', 'background']
    };

    // Check if matches any rhyme group
    for (const [ending, words] of Object.entries(rhymeGroups)) {
      if (wordLower.endsWith(ending)) {
        const filtered = words.filter(w => w !== wordLower);
        const shuffled = this.shuffleArray(filtered);
        return shuffled.slice(0, count);
      }
    }

    // If no rhyme match, use words with similar first letter or length
    const fallbackWords = this.generateFallbackWords(wordLower, count);
    return fallbackWords;
  }

  // Generate fallback similar words
  generateFallbackWords(word, count = 3) {
    const firstLetter = word[0];
    const wordLength = word.length;
    
    // Word bank based on first letter and length
    const wordsByFirstLetter = {
      'a': ['apple', 'animal', 'about', 'always', 'answer', 'action'],
      'b': ['book', 'ball', 'big', 'blue', 'black', 'build'],
      'c': ['cat', 'car', 'can', 'come', 'call', 'cool'],
      'd': ['dog', 'day', 'do', 'door', 'dark', 'deep'],
      'e': ['eat', 'eye', 'every', 'end', 'easy', 'earth'],
      'f': ['fish', 'find', 'from', 'face', 'fast', 'food'],
      'g': ['good', 'go', 'get', 'give', 'green', 'great'],
      'h': ['house', 'have', 'how', 'help', 'hand', 'head'],
      'i': ['in', 'is', 'if', 'into', 'it', 'ice'],
      'j': ['just', 'jump', 'job', 'join', 'joy', 'juice'],
      'k': ['keep', 'know', 'kind', 'key', 'king', 'kitchen'],
      'l': ['look', 'like', 'love', 'live', 'long', 'light'],
      'm': ['man', 'make', 'more', 'my', 'mouse', 'music'],
      'n': ['new', 'now', 'no', 'not', 'name', 'night'],
      'o': ['old', 'on', 'or', 'out', 'over', 'open'],
      'p': ['people', 'place', 'play', 'put', 'part', 'phone'],
      'q': ['question', 'quick', 'quiet', 'quite', 'queen', 'quote'],
      'r': ['run', 'right', 'read', 'red', 'room', 'round'],
      's': ['see', 'say', 'she', 'so', 'some', 'sun'],
      't': ['time', 'take', 'think', 'two', 'tree', 'table'],
      'u': ['up', 'use', 'under', 'us', 'until', 'unit'],
      'v': ['very', 'view', 'voice', 'visit', 'video', 'value'],
      'w': ['water', 'way', 'we', 'will', 'with', 'work'],
      'x': ['x-ray', 'xbox', 'xerox', 'xmas', 'axis', 'exam'],
      'y': ['you', 'your', 'yes', 'year', 'young', 'yellow'],
      'z': ['zero', 'zone', 'zoo', 'zoom', 'zip', 'zest']
    };

    const candidates = wordsByFirstLetter[firstLetter] || ['word', 'work', 'world', 'write', 'wrong', 'wait'];
    const filtered = candidates.filter(w => w !== word && Math.abs(w.length - wordLength) <= 2);
    
    if (filtered.length >= count) {
      return this.shuffleArray(filtered).slice(0, count);
    } else {
      // If not enough, supplement with some general words
      const extraWords = ['book', 'look', 'make', 'take', 'time', 'line', 'good', 'food', 'cool', 'tool'];
      const allCandidates = [...filtered, ...extraWords.filter(w => w !== word)];
      return this.shuffleArray(allCandidates).slice(0, count);
    }
  }

  // Randomly shuffle array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Generate complete practice questions
  generatePracticeQuestions(object) {
    const questions = [
      // Listen and choose - using sound-alike words
      {
        type: 'listen_and_choose',
        question: '🎧 Listen carefully and choose the correct English word',
        audio: object?.name,
        options: this.shuffleArray([
          object?.name,
          ...this.generateSimilarSoundingWords(object?.name, 3)
        ]),
        correctAnswer: object?.name,
        difficulty: 'hard',
        explanation: `The correct answer is "${object?.name}". Pay attention to distinguishing words with similar pronunciation.`,
        tips: 'Listen carefully to each syllable, pay attention to vowel and consonant differences'
      },

      // Chinese translation choice
      {
        type: 'translate',
        question: '📖 Choose the correct Chinese translation',
        word: object?.name,
        options: this.shuffleArray([
          object?.chineseName,
          ...this.generateSimilarMeanings(object?.chineseName, 3)
        ]),
        correctAnswer: object?.chineseName,
        difficulty: 'medium',
        explanation: `The correct Chinese translation of "${object?.name}" is "${object?.chineseName}".`,
        tips: 'Understand the specific meaning and usage context of the word'
      },

      // Pronunciation choice
      {
        type: 'pronunciation',
        question: '🔊 Choose the correct pronunciation',
        word: object?.name,
        options: this.shuffleArray([
          object?.pronunciation,
          ...this.generateSimilarPronunciation(object?.pronunciation, 3)
        ]),
        correctAnswer: object?.pronunciation,
        difficulty: 'hard',
        explanation: `The correct pronunciation of "${object?.name}" is ${object?.pronunciation}.`,
        tips: 'Pay attention to stress position and phonetic symbols'
      },

      // Sentence choice
      {
        type: 'sentence',
        question: '📝 Choose the correct sentence using this word',
        word: object?.name,
        options: this.shuffleArray([
          object?.examples?.[0] || `I can see a ${object?.name}.`,
          ...this.generateWrongSentences(object?.name, 3)
        ]),
        correctAnswer: object?.examples?.[0] || `I can see a ${object?.name}.`,
        difficulty: 'medium',
        explanation: `The correct sentence demonstrates the proper usage of "${object?.name}".`,
        tips: 'Pay attention to grammar structure and word collocations'
      }
    ];

    return questions;
  }

  // Generate similar meaning distractors
  generateSimilarMeanings(chineseName, count = 3) {
    const similarMeanings = {
      '狗': ['貓', '動物', '寵物'],
      '貓': ['狗', '動物', '寵物'],
      '汽車': ['車輛', '交通工具', '機車'],
      '房子': ['建築物', '家', '住所'],
      '電腦': ['電腦設備', '機器', '電子產品'],
      '手機': ['電話', '通訊設備', '電子產品'],
      '杯子': ['容器', '水杯', '器皿'],
      '椅子': ['座椅', '家具', '坐具'],
      '書': ['書籍', '讀物', '文件'],
      '樹': ['植物', '樹木', '綠植'],
      '花': ['植物', '花朵', '花卉']
    };

    const defaults = ['物品', '東西', '物體', '用品', '設備', '工具'];
    const candidates = similarMeanings[chineseName] || defaults;
    
    return this.shuffleArray(candidates.filter(item => item !== chineseName)).slice(0, count);
  }

  // Generate similar pronunciation marks
  generateSimilarPronunciation(pronunciation, count = 3) {
    const variations = [
      pronunciation?.replace(/ɒ/g, 'ɔ'),
      pronunciation?.replace(/iː/g, 'ɪ'),
      pronunciation?.replace(/uː/g, 'ʊ'),
      pronunciation?.replace(/eɪ/g, 'e'),
      pronunciation?.replace(/aɪ/g, 'æ'),
      pronunciation?.replace(/əʊ/g, 'ɒ'),
      pronunciation?.replace(/aʊ/g, 'ɔ'),
      pronunciation?.replace(/ɪə/g, 'ɪ'),
      pronunciation?.replace(/eə/g, 'e'),
      pronunciation?.replace(/ʊə/g, 'ʊ')
    ].filter(p => p && p !== pronunciation);

    if (variations.length >= count) {
      return variations.slice(0, count);
    }

    // If not enough variations, add some generic wrong pronunciations
    const fallbacks = ['/rɒŋ/', '/faɪl/', '/test/', '/wɜːd/', '/θɪŋ/', '/pleɪs/'];
    const allOptions = [...variations, ...fallbacks];
    return this.shuffleArray(allOptions.filter(p => p !== pronunciation)).slice(0, count);
  }

  // Generate wrong sentences
  generateWrongSentences(word, count = 3) {
    const wrongSentences = [
      `The ${word} is singing loudly.`,
      `I bought a ${word} from the supermarket.`,
      `My ${word} can fly very high.`,
      `This ${word} tastes really delicious.`,
      `The ${word} is driving too fast.`,
      `I need to charge my ${word}.`,
      `The ${word} is growing in the garden.`,
      `Please turn on the ${word}.`
    ];

    return this.shuffleArray(wrongSentences).slice(0, count);
  }
}

export default PracticeQuestionService;
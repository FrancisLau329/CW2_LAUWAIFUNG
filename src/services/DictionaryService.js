class DictionaryService {
  constructor() {
    this.dictionary = this.buildComprehensiveDictionary();
  }

  // Build comprehensive English-Chinese dictionary
  buildComprehensiveDictionary() {
    return {
      // Animals
      'dog': {
        chinese: '狗',
        pronunciation: '/dɒɡ/',
        category: 'Animals',
        difficulty: 'Beginner',
        definition: 'A loyal four-legged pet that barks and wags its tail when happy.',
        chineseDefinition: '一種忠誠的四足寵物，高興時會吠叫和搖尾巴。',
        usageNote: '常見的家庭寵物，需要定期遛狗和餵食。',
        synonyms: ['puppy', 'hound', 'canine'],
        examples: [
          'My dog loves to play fetch in the park.',
          'Dogs are known for being loyal companions.',
          'She walks her dog every morning.',
          'The dog barked at the stranger.'
        ],
        chineseExamples: [
          '我的狗喜歡在公園裡玩撿球遊戲。',
          '狗以忠誠的伴侶而聞名。',
          '她每天早上都會遛狗。',
          '狗對著陌生人吠叫。'
        ]
      },
      'cat': {
        chinese: '貓',
        pronunciation: '/kæt/',
        category: 'Animals',
        difficulty: 'Beginner',
        definition: 'A soft, furry pet that purrs and catches mice.',
        chineseDefinition: '一種柔軟毛茸茸的寵物，會發出呼嚕聲並捉老鼠。',
        usageNote: '獨立性強的寵物，喜歡乾淨，會用貓砂盆。',
        synonyms: ['kitten', 'feline', 'kitty'],
        examples: [
          'The cat sleeps on my bed every night.',
          'Cats are very independent animals.',
          'My cat loves to chase laser pointers.',
          'She adopted a stray cat from the shelter.'
        ],
        chineseExamples: [
          '貓咪每晚都睡在我的床上。',
          '貓是非常獨立的動物。',
          '我的貓喜歡追逐雷射筆。',
          '她從收容所領養了一隻流浪貓。'
        ]
      },
      'bird': {
        chinese: '鳥',
        pronunciation: '/bɜːrd/',
        category: 'Animals',
        difficulty: 'Beginner',
        definition: 'A feathered animal that can fly and sing beautiful songs.',
        chineseDefinition: '一種有羽毛的動物，能夠飛翔並唱出美妙的歌聲。',
        usageNote: '有些鳥類會遷徙，有些則是寵物鳥。',
        synonyms: ['fowl', 'avian'],
        examples: [
          'I love listening to birds singing in the morning.',
          'The bird built a nest in our apple tree.',
          'Many birds migrate south for winter.',
          'She keeps a colorful parrot as a pet bird.'
        ],
        chineseExamples: [
          '我喜歡聽鳥兒在早晨的歌唱。',
          '鳥兒在我們的蘋果樹上築了個巢。',
          '許多鳥類會南遷過冬。',
          '她養了一隻彩色的鸚鵡作為寵物鳥。'
        ]
      },

      // Daily Items
      'cup': {
        chinese: '杯子',
        pronunciation: '/kʌp/',
        category: 'Daily Items',
        difficulty: 'Beginner',
        definition: 'A small container used for drinking hot or cold beverages.',
        chineseDefinition: '用於飲用熱飲或冷飲的小型容器。',
        usageNote: '通常有把手，材質有陶瓷、玻璃、塑膠等。',
        synonyms: ['mug', 'glass', 'tumbler'],
        examples: [
          'I drink my morning coffee from this cup.',
          'Please bring me a cup of tea.',
          'The cup is too hot to touch.',
          'She collected vintage tea cups.'
        ],
        chineseExamples: [
          '我用這個杯子喝早晨的咖啡。',
          '請給我一杯茶。',
          '這個杯子太燙了，摸不得。',
          '她收集古董茶杯。'
        ]
      },
      'keyboard': {
        chinese: '鍵盤',
        pronunciation: '/ˈkiːbɔːrd/',
        category: 'Technology',
        difficulty: 'Intermediate',
        definition: 'A device with buttons (keys) used to type letters, numbers, and symbols on a computer.',
        chineseDefinition: '一種帶有按鍵的設備，用於在電腦上輸入字母、數字和符號。',
        usageNote: '現代鍵盤有機械式、薄膜式等不同類型，部分支援無線連接。',
        synonyms: ['keypad', 'input device'],
        examples: [
          'I type on my keyboard every day for work.',
          'This mechanical keyboard feels great to use.',
          'My wireless keyboard needs new batteries.',
          'She spilled coffee on her keyboard accidentally.'
        ],
        chineseExamples: [
          '我每天都用鍵盤工作打字。',
          '這個機械鍵盤使用感覺很棒。',
          '我的無線鍵盤需要換新電池。',
          '她不小心把咖啡灑在鍵盤上。'
        ]
      },
      'phone': {
        chinese: '手機',
        pronunciation: '/foʊn/',
        category: 'Technology',
        difficulty: 'Beginner',
        definition: 'A portable device used to make calls, send messages, and access the internet.',
        chineseDefinition: '一種便攜式設備，用於打電話、發訊息和上網。',
        usageNote: '現代智能手機功能豐富，包括拍照、導航、遊戲等。',
        synonyms: ['smartphone', 'mobile', 'cellphone'],
        examples: [
          'I forgot my phone at home today.',
          'Can you call me on my phone later?',
          'My phone battery is almost dead.',
          'She uses her phone to take beautiful photos.'
        ],
        chineseExamples: [
          '我今天忘記帶手機了。',
          '你能晚點打我手機嗎？',
          '我的手機電池快沒電了。',
          '她用手機拍美麗的照片。'
        ]
      },

      // Food
      'apple': {
        chinese: '蘋果',
        pronunciation: '/ˈæpəl/',
        category: 'Food',
        difficulty: 'Beginner',
        definition: 'A round, sweet fruit that can be red, green, or yellow, eaten fresh or used in cooking.',
        chineseDefinition: '一種圓形的甜味水果，可以是紅色、綠色或黃色，可以新鮮食用或用於烹飪。',
        usageNote: '富含維生素和纖維，是健康的零食選擇。',
        synonyms: ['fruit'],
        examples: [
          'An apple a day keeps the doctor away.',
          'I packed an apple in my lunch box.',
          'She made a delicious apple pie.',
          'Green apples are more sour than red ones.'
        ],
        chineseExamples: [
          '一天一蘋果，醫生遠離我。',
          '我在午餐盒裡放了一個蘋果。',
          '她做了一個美味的蘋果派。',
          '青蘋果比紅蘋果更酸。'
        ]
      },
      'bread': {
        chinese: '麵包',
        pronunciation: '/bred/',
        category: 'Food',
        difficulty: 'Beginner',
        definition: 'A basic food made from flour and water, baked in an oven, often eaten with meals.',
        chineseDefinition: '一種由麵粉和水製成的基本食物，在烤箱中烘焙，通常與餐點一起食用。',
        usageNote: '有白麵包、全麥麵包、法式麵包等多種類型。',
        synonyms: ['loaf', 'roll', 'baguette'],
        examples: [
          'I bought fresh bread from the bakery.',
          'She made sandwiches with whole wheat bread.',
          'The bread smells amazing when it\'s baking.',
          'French bread goes well with cheese.'
        ],
        chineseExamples: [
          '我從麵包店買了新鮮的麵包。',
          '她用全麥麵包做三明治。',
          '麵包烘焙時聞起來很香。',
          '法式麵包配起司很棒。'
        ]
      },

      // Transportation
      'car': {
        chinese: '汽車',
        pronunciation: '/kɑːr/',
        category: 'Transportation',
        difficulty: 'Beginner',
        definition: 'A four-wheeled motor vehicle used for transportation on roads.',
        chineseDefinition: '一種四輪機動車輛，用於在道路上運輸。',
        usageNote: '現代汽車有汽油車、電動車、混合動力車等類型。',
        synonyms: ['automobile', 'vehicle', 'auto'],
        examples: [
          'I drive my car to work every day.',
          'Electric cars are becoming more popular.',
          'We need to fill up the car with gas.',
          'Her new car has great fuel efficiency.'
        ],
        chineseExamples: [
          '我每天開車上班。',
          '電動汽車越來越受歡迎。',
          '我們需要給汽車加油。',
          '她的新車很省油。'
        ]
      },
      'bicycle': {
        chinese: '自行車',
        pronunciation: '/ˈbaɪsɪkəl/',
        category: 'Transportation',
        difficulty: 'Intermediate',
        definition: 'A two-wheeled vehicle that you ride by pedaling with your feet.',
        chineseDefinition: '一種雙輪交通工具，通過腳踩踏板來騎行。',
        usageNote: '環保的交通方式，也是很好的運動形式。',
        synonyms: ['bike', 'cycle'],
        examples: [
          'I ride my bicycle to school every morning.',
          'Cycling is great exercise for your legs.',
          'She bought a new mountain bicycle.',
          'Many cities have bicycle sharing programs.'
        ],
        chineseExamples: [
          '我每天早上騎自行車上學。',
          '騎自行車是很好的腿部運動。',
          '她買了一輛新的山地自行車。',
          '許多城市都有共享單車計劃。'
        ]
      },

      // Furniture
      'chair': {
        chinese: '椅子',
        pronunciation: '/tʃɛr/',
        category: 'Furniture',
        difficulty: 'Beginner',
        definition: 'A piece of furniture designed for one person to sit on, usually with a back and four legs.',
        chineseDefinition: '一種為一個人坐著而設計的家具，通常有靠背和四條腿。',
        usageNote: '有辦公椅、餐椅、休閒椅等不同類型。',
        synonyms: ['seat', 'stool'],
        examples: [
          'Please have a seat in that comfortable chair.',
          'I bought a new office chair for my desk.',
          'The antique chair belonged to my grandmother.',
          'This chair is too hard to sit on for long.'
        ],
        chineseExamples: [
          '請坐在那張舒適的椅子上。',
          '我為我的書桌買了一張新的辦公椅。',
          '這張古董椅子是我祖母的。',
          '這張椅子太硬了，不適合久坐。'
        ]
      },
      'table': {
        chinese: '桌子',
        pronunciation: '/ˈteɪbəl/',
        category: 'Furniture',
        difficulty: 'Beginner',
        definition: 'A piece of furniture with a flat top surface supported by legs, used for eating, working, or placing things.',
        chineseDefinition: '一種有平坦頂面並由腿支撐的家具，用於吃飯、工作或放置物品。',
        usageNote: '有餐桌、書桌、咖啡桌等不同用途的桌子。',
        synonyms: ['desk', 'counter'],
        examples: [
          'We eat dinner at the dining table.',
          'She put her laptop on the coffee table.',
          'The wooden table was handmade by my father.',
          'Can you clear the table after dinner?'
        ],
        chineseExamples: [
          '我們在餐桌上吃晚餐。',
          '她把筆記型電腦放在咖啡桌上。',
          '這張木桌是我父親親手製作的。',
          '晚餐後你能收拾桌子嗎？'
        ]
      },

      // Architecture
      'house': {
        chinese: '房子',
        pronunciation: '/haʊs/',
        category: 'Architecture',
        difficulty: 'Beginner',
        definition: 'A building where people live, typically with rooms for sleeping, cooking, and relaxing.',
        chineseDefinition: '人們居住的建築物，通常有臥室、廚房和休息室。',
        usageNote: '有獨棟房屋、公寓、別墅等不同類型。',
        synonyms: ['home', 'residence', 'dwelling'],
        examples: [
          'We bought a new house in the suburbs.',
          'My house has three bedrooms and two bathrooms.',
          'The old house needs some repairs.',
          'They painted their house bright yellow.'
        ],
        chineseExamples: [
          '我們在郊區買了一棟新房子。',
          '我的房子有三間臥室和兩間浴室。',
          '這棟老房子需要一些修繕。',
          '他們把房子漆成了亮黃色。'
        ]
      },

      // Nature
      'tree': {
        chinese: '樹',
        pronunciation: '/triː/',
        category: 'Nature',
        difficulty: 'Beginner',
        definition: 'A large plant with a thick wooden trunk, branches, and leaves that grows in the ground.',
        chineseDefinition: '一種有粗木質樹幹、樹枝和葉子的大型植物，生長在地面上。',
        usageNote: '樹木能淨化空氣，提供陰涼，美化環境。',
        synonyms: ['plant', 'oak', 'pine'],
        examples: [
          'The old oak tree provides shade for our yard.',
          'We planted a fruit tree in our garden.',
          'Many animals live in this tall tree.',
          'The tree\'s leaves change color in autumn.'
        ],
        chineseExamples: [
          '這棵老橡樹為我們的院子提供了陰涼。',
          '我們在花園裡種了一棵果樹。',
          '許多動物生活在這棵高樹上。',
          '這棵樹的葉子在秋天會變色。'
        ]
      },
      'flower': {
        chinese: '花',
        pronunciation: '/ˈflaʊər/',
        category: 'Nature',
        difficulty: 'Beginner',
        definition: 'The colorful, fragrant part of a plant that blooms and attracts insects for pollination.',
        chineseDefinition: '植物開花時彩色香香的部分，能吸引昆蟲來授粉。',
        usageNote: '花朵有不同的顏色、形狀和香味，常用於裝飾。',
        synonyms: ['blossom', 'bloom'],
        examples: [
          'She gave me a beautiful bouquet of flowers.',
          'The garden is full of colorful flowers.',
          'This flower has a sweet fragrance.',
          'Bees love to visit flowers for nectar.'
        ],
        chineseExamples: [
          '她給了我一束美麗的花。',
          '花園裡滿是彩色的花朵。',
          '這朵花有甜美的香味。',
          '蜜蜂喜歡到花朵上採蜜。'
        ]
      },

      // People
      'person': {
        chinese: '人',
        pronunciation: '/ˈpɜːrsən/',
        category: 'People',
        difficulty: 'Beginner',
        definition: 'A human being; an individual man, woman, or child.',
        chineseDefinition: '人類；個別的男人、女人或兒童。',
        usageNote: '通用詞，指代任何人類個體。',
        synonyms: ['individual', 'human', 'people'],
        examples: [
          'Each person has their own unique personality.',
          'A kind person helped me find my way.',
          'This person speaks three languages fluently.',
          'Every person deserves to be treated with respect.'
        ],
        chineseExamples: [
          '每個人都有自己獨特的個性。',
          '一位善良的人幫我找到了路。',
          '這個人能流利地說三種語言。',
          '每個人都應該受到尊重。'
        ]
      }
    };
  }

  // Get complete word information
  getWordInfo(word) {
    const normalizedWord = word.toLowerCase().trim();
    const wordInfo = this.dictionary[normalizedWord];
    
    if (wordInfo) {
      return {
        ...wordInfo,
        found: true,
        searchTerm: word
      };
    }
    
    // If not found, try similar word matching
    const similarWord = this.findSimilarWord(normalizedWord);
    if (similarWord) {
      return {
        ...this.dictionary[similarWord],
        found: true,
        searchTerm: word,
        suggestion: `Did you mean "${similarWord}"?`
      };
    }
    
    // If completely not found, return basic information
    return this.generateBasicInfo(word);
  }

  // Find similar words
  findSimilarWord(word) {
    const words = Object.keys(this.dictionary);
    
    // Exact match for plural forms
    if (word.endsWith('s')) {
      const singular = word.slice(0, -1);
      if (this.dictionary[singular]) {
        return singular;
      }
    }
    
    // Fuzzy matching
    for (const dictWord of words) {
      if (dictWord.includes(word) || word.includes(dictWord)) {
        return dictWord;
      }
    }
    
    return null;
  }

  // Generate basic vocabulary information
  generateBasicInfo(word) {
    const basicTranslations = {
      'water': '水', 'fire': '火', 'earth': '土', 'air': '空氣',
      'book': '書', 'pen': '筆', 'paper': '紙', 'computer': '電腦',
      'window': '窗戶', 'door': '門', 'wall': '牆', 'floor': '地板',
      'sky': '天空', 'cloud': '雲', 'sun': '太陽', 'moon': '月亮',
      'red': '紅色', 'blue': '藍色', 'green': '綠色', 'yellow': '黃色',
      'big': '大的', 'small': '小的', 'good': '好的', 'bad': '壞的'
    };

    const chinese = basicTranslations[word.toLowerCase()] || word;
    
    return {
      chinese,
      pronunciation: `/${word}/`,
      category: 'General',
      difficulty: 'Intermediate',
      definition: `A word identified through image recognition: ${word}`,
      chineseDefinition: `通過圖像識別發現的詞彙：${chinese}`,
      usageNote: '這是一個基本詞彙，建議查閱詳細詞典了解更多用法。',
      examples: [
        `I can see a ${word}.`,
        `This ${word} is interesting.`,
        `The ${word} looks good.`,
        `I like this ${word}.`
      ],
      chineseExamples: [
        `我能看到一個${chinese}。`,
        `這個${chinese}很有趣。`,
        `這個${chinese}看起來不錯。`,
        `我喜歡這個${chinese}。`
      ],
      found: false,
      searchTerm: word,
      suggestion: 'Recommend using a complete dictionary for more detailed information.'
    };
  }

  // Search dictionary
  searchDictionary(query) {
    const results = [];
    const normalizedQuery = query.toLowerCase().trim();
    
    if (normalizedQuery.length < 2) {
      return results;
    }
    
    Object.entries(this.dictionary).forEach(([word, info]) => {
      // English matching
      if (word.includes(normalizedQuery)) {
        results.push({ word, ...info, matchType: 'english' });
      }
      // Chinese matching
      else if (info.chinese.includes(normalizedQuery)) {
        results.push({ word, ...info, matchType: 'chinese' });
      }
      // Definition matching
      else if (info.definition.toLowerCase().includes(normalizedQuery)) {
        results.push({ word, ...info, matchType: 'definition' });
      }
    });
    
    return results.slice(0, 20); // Return maximum 20 results
  }

  // Get random word
  getRandomWord() {
    const words = Object.keys(this.dictionary);
    const randomWord = words[Math.floor(Math.random() * words.length)];
    return this.getWordInfo(randomWord);
  }

  // Get words by category
  getWordsByCategory(category) {
    const results = [];
    Object.entries(this.dictionary).forEach(([word, info]) => {
      if (info.category === category) {
        results.push({ word, ...info });
      }
    });
    return results;
  }

  // Get all categories
  getAllCategories() {
    const categories = new Set();
    Object.values(this.dictionary).forEach(info => {
      categories.add(info.category);
    });
    return Array.from(categories).sort();
  }

  // Get words by difficulty
  getWordsByDifficulty(difficulty) {
    const results = [];
    Object.entries(this.dictionary).forEach(([word, info]) => {
      if (info.difficulty === difficulty) {
        results.push({ word, ...info });
      }
    });
    return results;
  }
}

export default DictionaryService;
export interface Ayah {
  id: string;
  arabic: string;
  translation: string;
  transliteration?: string;
  reference: string;
  category: 'stress' | 'anxiety' | 'fear' | 'gratitude' | 'patience' | 'hope' | 'trust';
}

export interface Dua {
  id: string;
  arabic: string;
  translation: string;
  transliteration?: string;
  occasion: string;
  category: 'calm' | 'morning' | 'evening' | 'sleep' | 'anxiety' | 'gratitude';
}

export interface Dhikr {
  id: string;
  arabic: string;
  translation: string;
  transliteration: string;
  count: number;
  benefit: string;
}

export const ayat: Ayah[] = [
  {
    id: '1',
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translation: 'Verily, in the remembrance of Allah do hearts find rest.',
    transliteration: "Alā bidhikri Allāhi taṭma'innu al-qulūb",
    reference: 'Surah Ar-Ra\'d 13:28',
    category: 'stress'
  },
  {
    id: '2',
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'For indeed, with hardship comes ease. Indeed, with hardship comes ease.',
    transliteration: "Fa'inna ma'al 'usri yusrā. Inna ma'al 'usri yusrā",
    reference: 'Surah Ash-Sharh 94:5-6',
    category: 'hope'
  },
  {
    id: '3',
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    translation: 'And whoever relies upon Allah - then He is sufficient for him.',
    transliteration: 'Wa man yatawakkal \'alā Allāhi fahuwa ḥasbuh',
    reference: 'Surah At-Talaq 65:3',
    category: 'trust'
  },
  {
    id: '4',
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translation: 'Allah does not burden a soul beyond that it can bear.',
    transliteration: 'Lā yukallifu Allāhu nafsan illā wus\'ahā',
    reference: 'Surah Al-Baqarah 2:286',
    category: 'patience'
  },
  {
    id: '5',
    arabic: 'وَاصْبِرْ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    translation: 'And be patient. Indeed, Allah is with the patient.',
    transliteration: 'Waṣbir inna Allāha ma\'a aṣ-ṣābirīn',
    reference: 'Surah Al-Anfal 8:46',
    category: 'patience'
  },
  {
    id: '6',
    arabic: 'قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا',
    translation: 'Say: Nothing will happen to us except what Allah has decreed for us.',
    transliteration: 'Qul lan yuṣībanā illā mā kataba Allāhu lanā',
    reference: 'Surah At-Tawbah 9:51',
    category: 'trust'
  },
  {
    id: '7',
    arabic: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ',
    translation: 'And do not despair of relief from Allah.',
    transliteration: 'Wa lā tay\'asū min rawḥi Allāh',
    reference: 'Surah Yusuf 12:87',
    category: 'hope'
  },
  {
    id: '8',
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    translation: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
    transliteration: 'Fadhkurūnī adhkurkum washkurū lī wa lā takfurūn',
    reference: 'Surah Al-Baqarah 2:152',
    category: 'gratitude'
  },
  {
    id: '9',
    arabic: 'وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ',
    translation: 'And We are closer to him than his jugular vein.',
    transliteration: 'Wa naḥnu aqrabu ilayhi min ḥabli al-warīd',
    reference: 'Surah Qaf 50:16',
    category: 'anxiety'
  },
  {
    id: '10',
    arabic: 'إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ',
    translation: 'Indeed, the mercy of Allah is near to the doers of good.',
    transliteration: 'Inna raḥmata Allāhi qarībun min al-muḥsinīn',
    reference: 'Surah Al-A\'raf 7:56',
    category: 'hope'
  }
];

export const duas: Dua[] = [
  {
    id: '1',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ',
    translation: 'O Allah, I seek refuge in You from worry and grief.',
    transliteration: "Allāhumma innī a'ūdhu bika min al-hammi wal-ḥazan",
    occasion: 'When feeling anxious or worried',
    category: 'anxiety'
  },
  {
    id: '2',
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ',
    translation: 'Sufficient for me is Allah; there is no deity except Him. On Him I have relied.',
    transliteration: 'Ḥasbiya Allāhu lā ilāha illā huwa \'alayhi tawakkalt',
    occasion: 'When overwhelmed',
    category: 'calm'
  },
  {
    id: '3',
    arabic: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا',
    translation: 'O Allah, place light in my heart.',
    transliteration: 'Allāhumma ij\'al fī qalbī nūrā',
    occasion: 'Morning prayer',
    category: 'morning'
  },
  {
    id: '4',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    translation: 'In Your name, O Allah, I die and I live.',
    transliteration: 'Bismika Allāhumma amūtu wa aḥyā',
    occasion: 'Before sleeping',
    category: 'sleep'
  },
  {
    id: '5',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    translation: 'Praise be to Allah who gave us life after death, and to Him is the resurrection.',
    transliteration: 'Alḥamdu lillāhi alladhī aḥyānā ba\'da mā amātanā wa ilayhi an-nushūr',
    occasion: 'Upon waking',
    category: 'morning'
  },
  {
    id: '6',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي',
    translation: 'O Allah, grant me health in my body, grant me health in my hearing, grant me health in my sight.',
    transliteration: 'Allāhumma \'āfinī fī badanī, Allāhumma \'āfinī fī sam\'ī, Allāhumma \'āfinī fī baṣarī',
    occasion: 'Daily wellness',
    category: 'morning'
  }
];

export const adhkar: Dhikr[] = [
  {
    id: '1',
    arabic: 'سُبْحَانَ اللَّهِ',
    translation: 'Glory be to Allah',
    transliteration: 'Subḥān Allāh',
    count: 33,
    benefit: 'Purifies the heart and brings tranquility'
  },
  {
    id: '2',
    arabic: 'الْحَمْدُ لِلَّهِ',
    translation: 'Praise be to Allah',
    transliteration: 'Alḥamdu lillāh',
    count: 33,
    benefit: 'Cultivates gratitude and inner peace'
  },
  {
    id: '3',
    arabic: 'اللَّهُ أَكْبَرُ',
    translation: 'Allah is the Greatest',
    transliteration: 'Allāhu Akbar',
    count: 34,
    benefit: 'Reminds of Allah\'s majesty and power'
  },
  {
    id: '4',
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    translation: 'There is no deity except Allah',
    transliteration: 'Lā ilāha illa Allāh',
    count: 100,
    benefit: 'The greatest words of remembrance'
  },
  {
    id: '5',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    translation: 'I seek forgiveness from Allah',
    transliteration: 'Astaghfiru Allāh',
    count: 100,
    benefit: 'Brings relief from anxiety and opens doors of mercy'
  },
  {
    id: '6',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    translation: 'There is no power nor strength except through Allah',
    transliteration: 'Lā ḥawla wa lā quwwata illā billāh',
    count: 33,
    benefit: 'A treasure from Paradise, brings acceptance and surrender'
  }
];

export const moodResponses = {
  anxious: {
    message: "Allah is with you. Let's breathe together and remember His presence.",
    ayat: ayat.filter(a => a.category === 'anxiety' || a.category === 'trust'),
    duas: duas.filter(d => d.category === 'anxiety' || d.category === 'calm')
  },
  sad: {
    message: "Every hardship has an ease with it. Allah has not forgotten you.",
    ayat: ayat.filter(a => a.category === 'hope' || a.category === 'patience'),
    duas: duas.filter(d => d.category === 'calm')
  },
  grateful: {
    message: "Alhamdulillah! Gratitude multiplies blessings.",
    ayat: ayat.filter(a => a.category === 'gratitude'),
    duas: duas.filter(d => d.category === 'gratitude' || d.category === 'morning')
  },
  stressed: {
    message: "Take a moment to breathe. Allah does not burden you beyond your capacity.",
    ayat: ayat.filter(a => a.category === 'stress' || a.category === 'patience'),
    duas: duas.filter(d => d.category === 'anxiety' || d.category === 'calm')
  },
  peaceful: {
    message: "May this peace remain in your heart. Continue in remembrance.",
    ayat: ayat.filter(a => a.category === 'gratitude' || a.category === 'trust'),
    duas: duas.filter(d => d.category === 'morning')
  }
};

export type MoodType = keyof typeof moodResponses;

export const getRandomAyah = (category?: Ayah['category']): Ayah => {
  const filtered = category ? ayat.filter(a => a.category === category) : ayat;
  return filtered[Math.floor(Math.random() * filtered.length)];
};

export const getDailyAyah = (): Ayah => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return ayat[dayOfYear % ayat.length];
};

export const getRandomDua = (category?: Dua['category']): Dua => {
  const filtered = category ? duas.filter(d => d.category === category) : duas;
  return filtered[Math.floor(Math.random() * filtered.length)];
};

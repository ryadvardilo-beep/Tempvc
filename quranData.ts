import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export interface Reciter {
  id: string;
  name: string;
  country: string;
  style: string;
  surahs: {
    number: number;
    name: string;
    audioUrl: string;
    duration?: string;
  }[];
}

export const TOP_RECITERS: Reciter[] = [
  {
    id: 'ghamdi',
    name: 'سعد الغامدي',
    country: '🇸🇦 السعودية',
    style: 'ترتيل خاشع ومحبوب جداً',
    surahs: [
      { number: 1, name: 'الفاتحة', audioUrl: 'https://server7.mp3quran.net/s_gmd/001.mp3' },
      { number: 36, name: 'يس', audioUrl: 'https://server7.mp3quran.net/s_gmd/036.mp3' },
      { number: 55, name: 'الرحمن', audioUrl: 'https://server7.mp3quran.net/s_gmd/055.mp3' },
      { number: 56, name: 'الواقعة', audioUrl: 'https://server7.mp3quran.net/s_gmd/056.mp3' },
      { number: 67, name: 'الملك', audioUrl: 'https://server7.mp3quran.net/s_gmd/067.mp3' },
      { number: 112, name: 'الإخلاص', audioUrl: 'https://server7.mp3quran.net/s_gmd/112.mp3' },
    ],
  },
  {
    id: 'dosari',
    name: 'ياسر الدوسري',
    country: '🇸🇦 إمام الحرم المكي',
    style: 'صوت شجي ومؤثر',
    surahs: [
      { number: 1, name: 'الفاتحة', audioUrl: 'https://server11.mp3quran.net/yasser/001.mp3' },
      { number: 18, name: 'الكهف', audioUrl: 'https://server11.mp3quran.net/yasser/018.mp3' },
      { number: 36, name: 'يس', audioUrl: 'https://server11.mp3quran.net/yasser/036.mp3' },
      { number: 55, name: 'الرحمن', audioUrl: 'https://server11.mp3quran.net/yasser/055.mp3' },
      { number: 67, name: 'الملك', audioUrl: 'https://server11.mp3quran.net/yasser/067.mp3' },
    ],
  },
  {
    id: 'abdulbasit',
    name: 'عبد الباسط عبد الصمد',
    country: '🇪🇬 صوت مكة',
    style: 'تجويد وترتيل أسطوري',
    surahs: [
      { number: 1, name: 'الفاتحة', audioUrl: 'https://server7.mp3quran.net/basit/001.mp3' },
      { number: 36, name: 'يس', audioUrl: 'https://server7.mp3quran.net/basit/036.mp3' },
      { number: 55, name: 'الرحمن', audioUrl: 'https://server7.mp3quran.net/basit/055.mp3' },
      { number: 67, name: 'الملك', audioUrl: 'https://server7.mp3quran.net/basit/067.mp3' },
      { number: 112, name: 'الإخلاص', audioUrl: 'https://server7.mp3quran.net/basit/112.mp3' },
      { number: 113, name: 'الفلق', audioUrl: 'https://server7.mp3quran.net/basit/113.mp3' },
      { number: 114, name: 'الناس', audioUrl: 'https://server7.mp3quran.net/basit/114.mp3' },
    ],
  },
  {
    id: 'sudais',
    name: 'عبد الرحمن السديس',
    country: '🇸🇦 إمام الحرم المكي',
    style: 'قراءة حجازية مباركة رنانة',
    surahs: [
      { number: 1, name: 'الفاتحة', audioUrl: 'https://server11.mp3quran.net/sds/001.mp3' },
      { number: 18, name: 'الكهف', audioUrl: 'https://server11.mp3quran.net/sds/018.mp3' },
      { number: 36, name: 'يس', audioUrl: 'https://server11.mp3quran.net/sds/036.mp3' },
      { number: 67, name: 'الملك', audioUrl: 'https://server11.mp3quran.net/sds/067.mp3' },
    ],
  },
  {
    id: 'afasy',
    name: 'مشاري راشد العفاسي',
    country: '🇰🇼 الكويت',
    style: 'صوت عذب ندي وخاشع',
    surahs: [
      { number: 1, name: 'الفاتحة', audioUrl: 'https://server8.mp3quran.net/afs/001.mp3' },
      { number: 2, name: 'البقرة (آية الكرسي وخواتيمها)', audioUrl: 'https://server8.mp3quran.net/afs/002.mp3' },
      { number: 18, name: 'الكهف', audioUrl: 'https://server8.mp3quran.net/afs/018.mp3' },
      { number: 36, name: 'يس', audioUrl: 'https://server8.mp3quran.net/afs/036.mp3' },
      { number: 55, name: 'الرحمن', audioUrl: 'https://server8.mp3quran.net/afs/055.mp3' },
      { number: 67, name: 'الملك', audioUrl: 'https://server8.mp3quran.net/afs/067.mp3' },
    ],
  },
  {
    id: 'ajmy',
    name: 'أحمد بن علي العجمي',
    country: '🇸🇦 السعودية',
    style: 'قراءة هادئة ومريحة للنفس',
    surahs: [
      { number: 1, name: 'الفاتحة', audioUrl: 'https://server10.mp3quran.net/ajm/001.mp3' },
      { number: 18, name: 'الكهف', audioUrl: 'https://server10.mp3quran.net/ajm/018.mp3' },
      { number: 36, name: 'يس', audioUrl: 'https://server10.mp3quran.net/ajm/036.mp3' },
      { number: 55, name: 'الرحمن', audioUrl: 'https://server10.mp3quran.net/ajm/055.mp3' },
      { number: 67, name: 'الملك', audioUrl: 'https://server10.mp3quran.net/ajm/067.mp3' },
    ],
  },
  {
    id: 'shuraim',
    name: 'سعود الشريم',
    country: '🇸🇦 إمام الحرم السابق',
    style: 'ترتيل سريع محكم ومؤثر',
    surahs: [
      { number: 1, name: 'الفاتحة', audioUrl: 'https://server7.mp3quran.net/shur/001.mp3' },
      { number: 18, name: 'الكهف', audioUrl: 'https://server7.mp3quran.net/shur/018.mp3' },
      { number: 36, name: 'يس', audioUrl: 'https://server7.mp3quran.net/shur/036.mp3' },
      { number: 67, name: 'الملك', audioUrl: 'https://server7.mp3quran.net/shur/067.mp3' },
    ],
  },
  {
    id: 'maher',
    name: 'ماهر المعيقلي',
    country: '🇸🇦 إمام الحرم المكي',
    style: 'تلاوة ندية خاشعة ومحبوبة عالمياً',
    surahs: [
      { number: 1, name: 'الفاتحة', audioUrl: 'https://server12.mp3quran.net/maher/001.mp3' },
      { number: 18, name: 'الكهف', audioUrl: 'https://server12.mp3quran.net/maher/018.mp3' },
      { number: 36, name: 'يس', audioUrl: 'https://server12.mp3quran.net/maher/036.mp3' },
      { number: 55, name: 'الرحمن', audioUrl: 'https://server12.mp3quran.net/maher/055.mp3' },
      { number: 67, name: 'الملك', audioUrl: 'https://server12.mp3quran.net/maher/067.mp3' },
    ],
  },
];

export const FAMOUS_SURAHS = [
  { id: 'fatiha', number: 1, name: 'سورة الفاتحة', desc: 'أم الكتاب والسبع المثاني' },
  { id: 'kahf', number: 18, name: 'سورة الكهف', desc: 'نور ما بين الجمعتين وعصمة من الدجال' },
  { id: 'yaseen', number: 36, name: 'سورة يس', desc: 'قلب القرآن وتثبيت القلوب' },
  { id: 'rahman', number: 55, name: 'سورة الرحمن', desc: 'عروس القرآن وفضل نعم الله' },
  { id: 'waqiah', number: 56, name: 'سورة الواقعة', desc: 'جالبة الرزق ومذكرة بالآخرة' },
  { id: 'mulk', number: 67, name: 'سورة الملك', desc: 'المانعة المنجية من عذاب القبر' },
  { id: 'ikhlas', number: 112, name: 'سورة الإخلاص والمعوذتين', desc: 'تعدل ثلث القرآن والحفظ من كل شر' },
];

export const ADHKAR_CATEGORIES = {
  morning: {
    title: '🌅 أذكار الصباح المباركة',
    color: 0xf59e0b,
    items: [
      '«أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ»',
      '«اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ»',
      '«سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ» (3 مرات)',
      '«اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ» (3 مرات)',
      '«بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ» (3 مرات)',
      '«يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ»',
    ],
  },
  evening: {
    title: '🌇 أذكار المساء المباركة',
    color: 0x6366f1,
    items: [
      '«أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ»',
      '«اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ»',
      '«أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ» (3 مرات)',
      '«اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ»',
      '«اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ» (سيد الاستغفار)',
      '«حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ» (7 مرات)',
    ],
  },
  sleep: {
    title: '🌙 أذكار النوم والراحة',
    color: 0x8b5cf6,
    items: [
      '«بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِن أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ»',
      '«اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا»',
      'قراءة آية الكرسي: ﴿اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...﴾ [البقرة: 255] (من قرأها لا يزال عليه من الله حافظ حتى يصبح)',
      'قراءة آخر آيتين من سورة البقرة ﴿آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ...﴾ (من قرأهما في ليلة كفتاه)',
      'التسبيح 33، التحميد 33، والتكبير 34 قبل النوم.',
    ],
  },
  prayer: {
    title: '📿 أذكار ما بعد الصلاة المكتوبة',
    color: 0x10b981,
    items: [
      '«أَسْتَغْفِرُ اللَّهَ» (3 مرات)، «اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ»',
      '«لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لاَ مَانِعَ لِمَا أَعْطَيْتَ، وَلاَ مُعْطِيَ لِمَا مَنَعْتَ، وَلاَ يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ»',
      '«سُبْحَانَ اللَّهِ» (33)، «الْحَمْدُ لِلَّهِ» (33)، «اللَّهُ أَكْبَرُ» (33)، وتمام المائة: «لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ»',
      'قراءة آية الكرسي والمعوذات بعد كل صلاة مكتوبة.',
    ],
  },
  istighfar: {
    title: '🌱 استغفار وتوبة وتفريج الهموم',
    color: 0x059669,
    items: [
      '«أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ»',
      '«رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ» (100 مرة)',
      '«لاَ إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ» (دعاء ذي النون ما دعا به مكروب إلا فرج الله عنه)',
      '«لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ» (كنز من كنوز الجنة ودواء لتسعة وتسعين داء)',
    ],
  },
  tasbih: {
    title: '✨ سبحة إلكترونية وفضائل التسبيح',
    color: 0x0ea5e9,
    items: [
      '«سُبْحَانَ اللَّهِ وَبِحَمْدِهِ» (100 مرة تحط خطاياه وإن كانت مثل زبد البحر)',
      '«كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ»',
      '«سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ» (أحب الكلام إلى الله)',
      '«اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ» (من صلى علي صلاة صلى الله عليه بها عشراً)',
    ],
  },
};

/**
 * Creates the Master Quran & Adhkar Hub Embed
 */
export function buildQuranHubEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x059669)
    .setTitle('🕋 رَوْضَةُ القُرْآنِ الكَرِيمِ وَالأَذْكَارِ المُبَارَكَةِ')
    .setDescription(
      `قال الله تعالى: ﴿**أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ**﴾ [الرعد: 28]\n\n` +
      `مرحباً بكم في قسم القرآن الكريم والأذكار اليومية. استمع لكتاب الله بخشوع، وتصفح الأذكار والأدعية النبوية بضغطة زر واحدة:\n\n` +
      `🎧 **الاستماع للقرآن في الروم الصوتي:**\n` +
      `اضغط زر **«🎧 استماع إلى القرآن»** أدناه، وسينضم البوت فوراً إلى الروم الصوتي **\`🔊 quran listening\`** ليعرض لك قائمة السور وأشهر القراء للاختيار والاستماع بخشوع.\n\n` +
      `📿 **أذكار المسلم اليومية:**\n` +
      `اختر من الأزرار أدناه لعرض أذكار الصباح، المساء، النوم، الاستغفار، أو الأدعية الشاملة مباشرة في إمبد أنيق.`
    )
    .setImage('https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=80')
    .setFooter({
      text: 'SEK Quran Hub • صدقة جارية وتقبل الله منا ومنكم صالح الأعمال',
      iconURL: 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png',
    })
    .setTimestamp();
}

/**
 * Action rows with beautiful buttons for the Quran & Adhkar hub
 */
export function buildQuranHubButtons(): ActionRowBuilder<ButtonBuilder>[] {
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('quran_listen_join')
      .setLabel('🎧 استماع إلى القرآن الكريم')
      .setEmoji('📖')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('quran_adhkar_morning')
      .setLabel('أذكار الصباح')
      .setEmoji('🌅')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('quran_adhkar_evening')
      .setLabel('أذكار المساء')
      .setEmoji('🌇')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('quran_adhkar_sleep')
      .setLabel('أذكار النوم')
      .setEmoji('🌙')
      .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('quran_adhkar_prayer')
      .setLabel('أذكار بعد الصلاة')
      .setEmoji('📿')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('quran_adhkar_istighfar')
      .setLabel('استغفار وتوبة')
      .setEmoji('🌱')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('quran_adhkar_tasbih')
      .setLabel('تسبيح وسبحة')
      .setEmoji('✨')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('quran_random_ayah')
      .setLabel('آية وتدبّر')
      .setEmoji('📜')
      .setStyle(ButtonStyle.Success)
  );

  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('quran_stop_leave')
      .setLabel('إيقاف / خروج البوت من الفويس')
      .setEmoji('⏹️')
      .setStyle(ButtonStyle.Danger)
  );

  return [row1, row2, row3];
}

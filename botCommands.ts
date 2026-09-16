import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Message,
  GuildMember,
  ChannelType,
  PermissionFlagsBits,
  TextChannel,
  VoiceChannel,
  User,
} from 'discord.js';
import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { getAlgerianAiResponse } from './geminiService.js';

// Islamic & cultural Algerian wisdom quotes
const ISLAMIC_REMINDERS = [
  'قال رسول الله ﷺ: «مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ» (متفق عليه)',
  'قال تعالى: ﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾ [الرعد: 28]',
  'قال رسول الله ﷺ: «أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ»',
  'قال تعالى: ﴿وَقُولُوا لِلنَّاسِ حُسْنًا﴾ [البقرة: 83]',
  'قال رسول الله ﷺ: «تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ»',
  'قال رسول الله ﷺ: «اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ»',
  'قال تعالى: ﴿إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾ [الشرح: 6]',
  'قال رسول الله ﷺ: «إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ»',
];

const ADHKAR = [
  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
  'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ',
  'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ ﷺ',
  'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
  'الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ',
  'اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنَّا',
];

const ALGERIAN_PROVERBS = [
  '«الـلّي فـات مـات، والـلّي جـاي فـالـغـيـب، عـيـش يـومـك بـالـخـيـر والـنـيـة الـصـافـيـة.»',
  '«الـصّـحـبـة نـيـة مـاشـي حـيـلـة والـرّجـلـة مـواقـف مـاشـي هـدرة.»',
  '«خـالـط الـنـاس الـلّـي تـربـح مـعـاهـم ديـنـك ودنـيـاك.»',
  '«الـلّـي مـا عـنـدو سـيـد يـحـوس عـلـى سـيـد، والـلّـي عـنـدو ربّـي مـا يـخـاف مـن والـو.»',
  '«الـكـلـمـة الـطـيّـبـة صـدقـة، وسـتـر الـنـاس فـضـيـلـة.»',
  '«يـا قـاطـع الـيـاس كـايـن ربّـي، رزقـك كـاتـبـو الـخـالـق مـن قـبـل مـا تـولـد.»',
  '«الـرجـال تـتـلاقـى والـجـبـال تـبـقـى.»',
];

export interface CommandDef {
  name: string;
  description: string;
  category: 'ai' | 'voice' | 'islamic' | 'fun' | 'utility' | 'moderation';
  options?: any[];
  executeText?: (message: Message, args: string[], ctx: any) => Promise<any>;
  executeSlash?: (interaction: ChatInputCommandInteraction, ctx: any) => Promise<any>;
}

export const COMMANDS_REGISTRY: CommandDef[] = [
  // ==================== 1. AI & ALGERIAN DARJA (1-3) ====================
  {
    name: 'ai',
    description: 'تحدث مع الذكاء الاصطناعي الجزائري الأصيل والمثقف بالدارجة',
    category: 'ai',
    options: [
      {
        name: 'prompt',
        description: 'سؤالك أو رسالتك للبوت',
        type: 3, // STRING
        required: true,
      },
    ],
    executeSlash: async (interaction, ctx) => {
      const prompt = interaction.options.getString('prompt', true);
      await interaction.deferReply();
      const answer = await getAlgerianAiResponse(prompt, interaction.user.username);
      await interaction.editReply(answer);
      ctx.addLog('ai', `استشارة الذكاء الاصطناعي من ${interaction.user.username}: ${prompt.slice(0, 30)}`, undefined, interaction.user.id);
    },
    executeText: async (message, args, ctx) => {
      const prompt = args.join(' ');
      if (!prompt) {
        return message.reply('واش خويا؟ اكتبلي سؤالك ولا واش تحب نحكو! مثال: `!ai واش تنصحني نقرا؟`');
      }
      const typingPromise = message.channel.sendTyping();
      const answer = await getAlgerianAiResponse(prompt, message.author.username);
      await typingPromise.catch(() => {});
      await message.reply(answer);
      ctx.addLog('ai', `استشارة الذكاء الاصطناعي من ${message.author.username}: ${prompt.slice(0, 30)}`, message.channel.id, message.author.id);
    },
  },
  {
    name: 'nasiha',
    description: 'طلب نصيحة أخوية وثقافية بالدارجة الجزائرية من البوت',
    category: 'ai',
    executeSlash: async (interaction) => {
      await interaction.deferReply();
      const res = await getAlgerianAiResponse('أعطيني نصيحة أخوية من القلب بالدارجة الجزائرية فيها حكمة ورجلة ودين وخير.', interaction.user.username);
      await interaction.editReply(`💡 **نصيحة من القلب ليك خويا:**\n\n${res}`);
    },
    executeText: async (message) => {
      await message.channel.sendTyping();
      const res = await getAlgerianAiResponse('أعطيني نصيحة أخوية من القلب بالدارجة الجزائرية فيها حكمة ورجلة ودين وخير.', message.author.username);
      await message.reply(`💡 **نصيحة من القلب ليك خويا:**\n\n${res}`);
    },
  },
  {
    name: 'tafsir',
    description: 'شرح مبسط ومثقف لآية أو حديث بالدارجة واللغة السهلة',
    category: 'ai',
    options: [{ name: 'topic', description: 'الآية أو الموضوع الديني', type: 3, required: true }],
    executeSlash: async (interaction) => {
      const topic = interaction.options.getString('topic', true);
      await interaction.deferReply();
      const res = await getAlgerianAiResponse(`فسرلي أو فكرني بحكمة حول: ${topic} بطريقة دينية ومثقفة وواضحة جداً.`, interaction.user.username);
      await interaction.editReply(`📖 **الفائدة والتفسير حول [${topic}]:**\n\n${res}`);
    },
    executeText: async (message, args) => {
      const topic = args.join(' ') || 'الصبر والتوكل على الله';
      await message.channel.sendTyping();
      const res = await getAlgerianAiResponse(`فسرلي أو فكرني بحكمة حول: ${topic} بطريقة دينية ومثقفة وواضحة جداً.`, message.author.username);
      await message.reply(`📖 **الفائدة والتفسير حول [${topic}]:**\n\n${res}`);
    },
  },

  // ==================== 2. ISLAMIC COMMANDS (4-12) ====================
  {
    name: 'quran',
    description: 'آية قرآنية كريمة مريحة للقلب مع التذكير',
    category: 'islamic',
    executeSlash: async (interaction) => {
      const ayah = ISLAMIC_REMINDERS[Math.floor(Math.random() * ISLAMIC_REMINDERS.length)];
      const embed = new EmbedBuilder()
        .setColor(0x10b981)
        .setTitle('📖 تذكرة من كتاب الله وسنة رسوله')
        .setDescription(ayah)
        .setFooter({ text: 'AlphaGenerator • ذكر فإن الذكرى تنفع المؤمنين' });
      await interaction.reply({ embeds: [embed] });
    },
    executeText: async (message) => {
      const ayah = ISLAMIC_REMINDERS[Math.floor(Math.random() * ISLAMIC_REMINDERS.length)];
      const embed = new EmbedBuilder()
        .setColor(0x10b981)
        .setTitle('📖 تذكرة من كتاب الله وسنة رسوله')
        .setDescription(ayah)
        .setFooter({ text: 'AlphaGenerator • ذكر فإن الذكرى تنفع المؤمنين' });
      await message.reply({ embeds: [embed] });
    },
  },
  {
    name: 'hadith',
    description: 'حديث نبوي شريف صحيح',
    category: 'islamic',
    executeSlash: async (interaction) => {
      const hadith = ISLAMIC_REMINDERS.filter((s) => s.includes('رسول الله'))[Math.floor(Math.random() * 4)] || ISLAMIC_REMINDERS[0];
      const embed = new EmbedBuilder()
        .setColor(0x059669)
        .setTitle('🌿 حديث نبوي شريف')
        .setDescription(hadith)
        .setFooter({ text: 'اللهم صل وسلم على نبينا محمد' });
      await interaction.reply({ embeds: [embed] });
    },
    executeText: async (message) => {
      const hadith = ISLAMIC_REMINDERS.filter((s) => s.includes('رسول الله'))[Math.floor(Math.random() * 4)] || ISLAMIC_REMINDERS[0];
      const embed = new EmbedBuilder()
        .setColor(0x059669)
        .setTitle('🌿 حديث نبوي شريف')
        .setDescription(hadith)
        .setFooter({ text: 'اللهم صل وسلم على نبينا محمد' });
      await message.reply({ embeds: [embed] });
    },
  },
  {
    name: 'dhikr',
    description: 'ذكر واستغفار لكسب الأجر والثواب',
    category: 'islamic',
    executeSlash: async (interaction) => {
      const d = ADHKAR[Math.floor(Math.random() * ADHKAR.length)];
      await interaction.reply({ content: `✨ **عطّر لسانك بذكر الله:**\n\n> 📿 **« ${d} »**\n\n*تقبل الله منا ومنكم صالح الأعمال.*` });
    },
    executeText: async (message) => {
      const d = ADHKAR[Math.floor(Math.random() * ADHKAR.length)];
      await message.reply(`✨ **عطّر لسانك بذكر الله:**\n\n> 📿 **« ${d} »**\n\n*تقبل الله منا ومنكم صالح الأعمال.*`);
    },
  },
  {
    name: 'prayer',
    description: 'تذكير بمواقيت الصلوات الخمس وفضل الصلاة لوقتها',
    category: 'islamic',
    executeSlash: async (interaction) => {
      const embed = new EmbedBuilder()
        .setColor(0x3b82f6)
        .setTitle('🕌 الصلاة عماد الدين')
        .setDescription(
          `قال الله تعالى: ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾ [النساء: 103]\n\n` +
          `حافظ أخي على صلواتك الخمس في أوقاتها مع جماعة المسلمين:\n` +
          `🌅 **الفجر** • ☀️ **الظهر** • 🌤️ **العصر** • 🌇 **المغرب** • 🌌 **العشاء**\n\n` +
          `*«أحب الأعمال إلى الله: الصلاة لوقتها ثم بر الوالدين»*`
        )
        .setFooter({ text: 'أقم صلاتك تحلو حياتك' });
      await interaction.reply({ embeds: [embed] });
    },
    executeText: async (message) => {
      const embed = new EmbedBuilder()
        .setColor(0x3b82f6)
        .setTitle('🕌 الصلاة عماد الدين')
        .setDescription(
          `قال الله تعالى: ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾ [النساء: 103]\n\n` +
          `حافظ أخي على صلواتك الخمس في أوقاتها مع جماعة المسلمين:\n` +
          `🌅 **الفجر** • ☀️ **الظهر** • 🌤️ **العصر** • 🌇 **المغرب** • 🌌 **العشاء**\n\n` +
          `*«أحب الأعمال إلى الله: الصلاة لوقتها ثم بر الوالدين»*`
        )
        .setFooter({ text: 'أقم صلاتك تحلو حياتك' });
      await message.reply({ embeds: [embed] });
    },
  },
  {
    name: 'dua',
    description: 'دعاء مأثور جامع لخيري الدنيا والآخرة',
    category: 'islamic',
    executeSlash: async (interaction) => {
      const duas = [
        '«رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ»',
        '«يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ»',
        '«اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى»',
        '«رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي»',
        '«اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ»',
      ];
      const selected = duas[Math.floor(Math.random() * duas.length)];
      await interaction.reply({ content: `🤲 **دعاء مبارك:**\n\n> 💫 **${selected}**\n\n*آمين يا رب العالمين.*` });
    },
    executeText: async (message) => {
      const duas = [
        '«رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ»',
        '«يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ»',
        '«اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى»',
        '«رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي»',
        '«اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ»',
      ];
      const selected = duas[Math.floor(Math.random() * duas.length)];
      await message.reply(`🤲 **دعاء مبارك:**\n\n> 💫 **${selected}**\n\n*آمين يا رب العالمين.*`);
    },
  },
  {
    name: 'istighfar',
    description: 'فضل الاستغفار وصيغته النبوية',
    category: 'islamic',
    executeSlash: async (interaction) => {
      await interaction.reply({
        content: `🌱 **سيد الاستغفار:**\n> «اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ»`,
      });
    },
    executeText: async (message) => {
      await message.reply({
        content: `🌱 **سيد الاستغفار:**\n> «اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ»`,
      });
    },
  },
  {
    name: 'salat',
    description: 'فضل الصلاة على النبي ﷺ',
    category: 'islamic',
    executeSlash: async (interaction) => {
      await interaction.reply({
        content: `🌺 **قال النبي ﷺ:** «مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا»\n\n> **اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ**`,
      });
    },
    executeText: async (message) => {
      await message.reply(
        `🌺 **قال النبي ﷺ:** «مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا»\n\n> **اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ**`
      );
    },
  },
  {
    name: 'friday',
    description: 'سنن وفضائل يوم الجمعة المبارك',
    category: 'islamic',
    executeSlash: async (interaction) => {
      await interaction.reply({
        content: `🕌 **سنن يوم الجمعة المبارك:**\n` +
          `1️⃣ الاغتسال والتطيب ولبس أحسن الثياب\n` +
          `2️⃣ التبكير إلى المسجد لأداء صلاة الجمعة\n` +
          `3️⃣ قراءة سورة الكهف (نور ما بين الجمعتين)\n` +
          `4️⃣ الإكثار من الصلاة على النبي ﷺ\n` +
          `5️⃣ تحري ساعة الإجابة في آخر النهار قبل المغرب.`,
      });
    },
    executeText: async (message) => {
      await message.reply(
        `🕌 **سنن يوم الجمعة المبارك:**\n` +
        `1️⃣ الاغتسال والتطيب ولبس أحسن الثياب\n` +
        `2️⃣ التبكير إلى المسجد لأداء صلاة الجمعة\n` +
        `3️⃣ قراءة سورة الكهف (نور ما بين الجمعتين)\n` +
        `4️⃣ الإكثار من الصلاة على النبي ﷺ\n` +
        `5️⃣ تحري ساعة الإجابة في آخر النهار قبل المغرب.`
      );
    },
  },
  {
    name: 'kahf',
    description: 'تذكير وفضل قراءة سورة الكهف',
    category: 'islamic',
    executeSlash: async (interaction) => {
      await interaction.reply({
        content: `📖 قال رسول الله ﷺ: «مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ»\n\nرابط لقراءتها إلكترونياً: https://quran.com/18`,
      });
    },
    executeText: async (message) => {
      await message.reply(
        `📖 قال رسول الله ﷺ: «مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ»\n\nرابط لقراءتها إلكترونياً: https://quran.com/18`
      );
    },
  },

  // ==================== 3. CULTURAL & PROVERBS (13-16) ====================
  {
    name: 'amthal',
    description: 'مثل وحكمة شعبية جزائرية قديمة أصيلة',
    category: 'fun',
    executeSlash: async (interaction) => {
      const p = ALGERIAN_PROVERBS[Math.floor(Math.random() * ALGERIAN_PROVERBS.length)];
      await interaction.reply({ content: `🇩🇿 **قالوا ناس زمان في الجزائر:**\n\n> 📜 ${p}` });
    },
    executeText: async (message) => {
      const p = ALGERIAN_PROVERBS[Math.floor(Math.random() * ALGERIAN_PROVERBS.length)];
      await message.reply(`🇩🇿 **قالوا ناس زمان في الجزائر:**\n\n> 📜 ${p}`);
    },
  },
  {
    name: 'dz',
    description: 'معلومات تاريخية أو ثقافية عن الجزائر الحبيبة',
    category: 'fun',
    executeSlash: async (interaction) => {
      const facts = [
        '🇩🇿 الجزائر هي أكبر دولة في أفريقيا والعالم العربي والبحر الأبيض المتوسط من حيث المساحة (2,381,741 كم²).',
        '🇩🇿 الجزائر أرض الشهداء، قدمت أكثر من مليون ونصف مليون شهيد في ثورة التحرير المباركة نيل الاستقلال.',
        '🇩🇿 جامع الجزائر الأعظم هو ثالث أكبر مسجد في العالم وأطول مئذنة في العالم بارتفاع 265 متراً.',
        '🇩🇿 الجزائر تزخر بـ 7 مواقع مدرجة ضمن التراث العالمي لليونسكو، منها طاسيلي ناجر وقلعة بني حماد والقصبة وتيمقاد.',
      ];
      await interaction.reply({ content: facts[Math.floor(Math.random() * facts.length)] });
    },
    executeText: async (message) => {
      const facts = [
        '🇩🇿 الجزائر هي أكبر دولة في أفريقيا والعالم العربي والبحر الأبيض المتوسط من حيث المساحة (2,381,741 كم²).',
        '🇩🇿 الجزائر أرض الشهداء، قدمت أكثر من مليون ونصف مليون شهيد في ثورة التحرير المباركة نيل الاستقلال.',
        '🇩🇿 جامع الجزائر الأعظم هو ثالث أكبر مسجد في العالم وأطول مئذنة في العالم بارتفاع 265 متراً.',
        '🇩🇿 الجزائر تزخر بـ 7 مواقع مدرجة ضمن التراث العالمي لليونسكو، منها طاسيلي ناجر وقلعة بني حماد والقصبة وتيمقاد.',
      ];
      await message.reply(facts[Math.floor(Math.random() * facts.length)]);
    },
  },
  {
    name: 'tahia',
    description: 'تحية إسلامية جزائرية طيبة',
    category: 'fun',
    executeSlash: async (interaction) => {
      await interaction.reply(`وعليكم السلام ورحمة الله وبركاته يا خويا <@${interaction.user.id}>! مرحباً بك، ربي يبارك فيك وفي والديك ويسعد أيامك.`);
    },
    executeText: async (message) => {
      await message.reply(`وعليكم السلام ورحمة الله وبركاته يا خويا <@${message.author.id}>! مرحباً بك، ربي يبارك فيك وفي والديك ويسعد أيامك.`);
    },
  },
  {
    name: 'marhaba',
    description: 'ترحيب بالدارجة الجزائرية الأصيلة',
    category: 'fun',
    executeSlash: async (interaction) => {
      await interaction.reply(`مية أهلاً وسهلاً بالزين! نورت السيرفر يا خويا العزيز، الدار دارك وإذا خصتك أي عفسة رانا هنا خاوة في الخير.`);
    },
    executeText: async (message) => {
      await message.reply(`مية أهلاً وسهلاً بالزين! نورت السيرفر يا خويا العزيز، الدار دارك وإذا خصتك أي عفسة رانا هنا خاوة في الخير.`);
    },
  },

  // ==================== 4. MODERATION & STAFF SUITE (STAFF & OWNER FOCUS) ====================
  {
    name: 'lockchat',
    description: '🔒 قفل الشات الكتابي ومنع الأعضاء من الكتابة (!بلع أو !lockchat)',
    category: 'moderation',
    executeSlash: async (interaction) => {
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: '❌ لا تملك صلاحية `Manage Channels`!', ephemeral: true });
      }
      const channel = interaction.channel as TextChannel;
      await channel.permissionOverwrites.edit(interaction.guild!.id, { SendMessages: false });
      await interaction.reply('🔒 **تم بلع (قفل) هذه القناة الكتابية ومنع الكتابة فيها مؤقتاً.**');
    },
    executeText: async (message) => {
      if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('❌ لا تملك صلاحية `Manage Channels`!');
      }
      const channel = message.channel as TextChannel;
      await channel.permissionOverwrites.edit(message.guild!.id, { SendMessages: false });
      await message.reply('🔒 **تم بلع الشات وقفل الإرسال للجميع!**');
    },
  },
  {
    name: 'unlockchat',
    description: '🔓 فتح الشات الكتابي والسماح للجميع بالكتابة (!حل أو !unlockchat)',
    category: 'moderation',
    executeSlash: async (interaction) => {
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: '❌ لا تملك صلاحية `Manage Channels`!', ephemeral: true });
      }
      const channel = interaction.channel as TextChannel;
      await channel.permissionOverwrites.edit(interaction.guild!.id, { SendMessages: true });
      await interaction.reply('🔓 **تم فتح الشات الكتابي والسماح للجميع بالمحادثة.**');
    },
    executeText: async (message) => {
      if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('❌ لا تملك صلاحية `Manage Channels`!');
      }
      const channel = message.channel as TextChannel;
      await channel.permissionOverwrites.edit(message.guild!.id, { SendMessages: true });
      await message.reply('🔓 **تم فتح الشات والسماح بالكتابة مجدداً!**');
    },
  },
  {
    name: 'mute',
    description: '🔇 إعطاء تايم أوت / كتم لعضو في السيرفر (!اسكت أو !mute)',
    category: 'moderation',
    options: [
      { name: 'user', description: 'العضو المراد كتمه', type: 6, required: true },
      { name: 'minutes', description: 'المدة بالدقائق (مثلاً: 10)', type: 4, required: false },
      { name: 'reason', description: 'السبب', type: 3, required: false },
    ],
    executeSlash: async (interaction) => {
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return interaction.reply({ content: '❌ لا تملك صلاحية إعطاء تايم أوت `Moderate Members`!', ephemeral: true });
      }
      const targetUser = interaction.options.getUser('user', true);
      const minutes = interaction.options.getInteger('minutes') || 10;
      const reason = interaction.options.getString('reason') || 'مخالفة قوانين السيرفر';
      const targetMember = interaction.guild!.members.cache.get(targetUser.id);
      if (!targetMember) return interaction.reply({ content: 'العضو غير موجود بالسيرفر!', ephemeral: true });
      if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ لا يمكنك كتم إداري!', ephemeral: true });
      }
      await targetMember.timeout(minutes * 60 * 1000, reason);
      await interaction.reply(`🔇 **تم كتم العضو <@${targetUser.id}> لمدة ${minutes} دقيقة.**\nالسبب: *${reason}*`);
    },
    executeText: async (message, args) => {
      if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply('❌ لا تملك صلاحية `Moderate Members`!');
      }
      const target = message.mentions.members?.first();
      if (!target) return message.reply('منشن العضو المراد كتمه: `!mute @user 10 السبب`');
      if (target.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply('❌ لا يمكنك كتم إداري بالسيرفر!');
      }
      const minutes = parseInt(args[1] || '10', 10);
      const reason = args.slice(2).join(' ') || 'مخالفة قوانين السيرفر';
      await target.timeout(minutes * 60 * 1000, reason);
      await message.reply(`🔇 **تم كتم <@${target.id}> (Timeout) لمدة ${minutes} دقيقة.**`);
    },
  },
  {
    name: 'unmute',
    description: '🔊 فك الكتم / التايم أوت عن عضو (!تكلم أو !unmute)',
    category: 'moderation',
    options: [{ name: 'user', description: 'العضو المراد فك كتمه', type: 6, required: true }],
    executeSlash: async (interaction) => {
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return interaction.reply({ content: '❌ لا تملك صلاحية `Moderate Members`!', ephemeral: true });
      }
      const targetUser = interaction.options.getUser('user', true);
      const targetMember = interaction.guild!.members.cache.get(targetUser.id);
      if (!targetMember) return interaction.reply({ content: 'العضو غير موجود بالسيرفر!', ephemeral: true });
      await targetMember.timeout(null);
      await interaction.reply(`🔊 **تم فك الكتم عن العضو <@${targetUser.id}> بنجاح.**`);
    },
    executeText: async (message) => {
      if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply('❌ لا تملك صلاحية `Moderate Members`!');
      }
      const target = message.mentions.members?.first();
      if (!target) return message.reply('منشن العضو: `!unmute @user`');
      await target.timeout(null);
      await message.reply(`🔊 **تم فك الكتم عن <@${target.id}> بنجاح.**`);
    },
  },
  {
    name: 'warn',
    description: '⚠️ توجيه إنذار رسمي لعضو في السيرفر (!تحذير أو !warn)',
    category: 'moderation',
    options: [
      { name: 'user', description: 'العضو المراد تحذيره', type: 6, required: true },
      { name: 'reason', description: 'سبب التحذير', type: 3, required: true },
    ],
    executeSlash: async (interaction) => {
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return interaction.reply({ content: '❌ لا تملك صلاحيات المشرفين!', ephemeral: true });
      }
      const targetUser = interaction.options.getUser('user', true);
      const reason = interaction.options.getString('reason', true);
      const embed = new EmbedBuilder()
        .setColor(0xf59e0b)
        .setTitle('⚠️ إنذار رسمي من إدارة السيرفر')
        .setDescription(`تم توجيه إنذار رسمي إلى <@${targetUser.id}>\n\n**السبب:** ${reason}\n**المشرف:** <@${member.id}>`)
        .setFooter({ text: 'يرجى الالتزام بقوانين السيرفر لتفادي الحظر أو الطرد' });
      await interaction.reply({ embeds: [embed] });
      await targetUser.send(`⚠️ لقد تلقيت إنذاراً في سيرفر **${interaction.guild!.name}** بسبب: ${reason}`).catch(() => {});
    },
    executeText: async (message, args) => {
      if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return message.reply('❌ لا تملك صلاحيات المشرفين!');
      }
      const target = message.mentions.users.first();
      if (!target) return message.reply('منشن العضو واكتب السبب: `!warn @user السب في الشات`');
      const reason = args.slice(1).join(' ') || 'مخالفة القوانين';
      const embed = new EmbedBuilder()
        .setColor(0xf59e0b)
        .setTitle('⚠️ إنذار رسمي من إدارة السيرفر')
        .setDescription(`تم توجيه إنذار رسمي إلى <@${target.id}>\n\n**السبب:** ${reason}\n**المشرف:** <@${message.author.id}>`);
      await message.channel.send({ embeds: [embed] });
      await target.send(`⚠️ لقد تلقيت إنذاراً في سيرفر **${message.guild!.name}** بسبب: ${reason}`).catch(() => {});
    },
  },
  {
    name: 'aichannel',
    description: '🤖 تحديد القناة المسموح فيها للذكاء الاصطناعي أو تفعيله/تعطيله (للسطاف والاونر)',
    category: 'moderation',
    options: [
      {
        name: 'action',
        description: 'الإجراء: set (تحديد القناة الحالية)، enable (تشغيل في كل مكان)، disable (تعطيل كامل)',
        type: 3,
        required: true,
        choices: [
          { name: 'تحديد هذه القناة فقط (Only This Channel)', value: 'set' },
          { name: 'تشغيل في كل السيرفر (All Channels)', value: 'enable' },
          { name: 'تعطيل الذكاء بالكامل (Disable AI)', value: 'disable' },
        ],
      },
    ],
    executeSlash: async (interaction, ctx) => {
      const member = interaction.member as GuildMember;
      const isOwner = interaction.guild!.ownerId === member.id;
      const isHighStaff = member.permissions.has(PermissionFlagsBits.Administrator) ||
        member.roles.cache.some((r) => ctx.config.highStaffRoleIds.includes(r.id));

      if (!isOwner && !isHighStaff) {
        return interaction.reply({ content: '❌ هذا الأمر خاص بالأونر وطاقم الإدارة العليا فقط!', ephemeral: true });
      }

      const act = interaction.options.getString('action', true);
      if (act === 'disable') {
        ctx.config.aiEnabled = false;
        await interaction.reply('🛑 **تم تعطيل الذكاء الاصطناعي بالكامل في السيرفر بواسطة الإدارة.**');
      } else if (act === 'enable') {
        ctx.config.aiEnabled = true;
        ctx.config.allowedAiChannelId = null;
        await interaction.reply('🟢 **تم تشغيل الذكاء الاصطناعي في جميع قنوات السيرفر.**');
      } else if (act === 'set') {
        ctx.config.aiEnabled = true;
        ctx.config.allowedAiChannelId = interaction.channelId;
        await interaction.reply(`🎯 **تم حصر الذكاء الاصطناعي في هذه القناة فقط (<#${interaction.channelId}>). لن يستجيب في القنوات الأخرى تفادياً للإزعاج.**`);
      }
    },
    executeText: async (message, args, ctx) => {
      const isOwner = message.guild!.ownerId === message.author.id;
      const isHighStaff = message.member?.permissions.has(PermissionFlagsBits.Administrator) ||
        message.member?.roles.cache.some((r) => ctx.config.highStaffRoleIds.includes(r.id));

      if (!isOwner && !isHighStaff) {
        return message.reply('❌ هذا الأمر خاص بالأونر والسطاف فقط!');
      }

      const sub = (args[0] || '').toLowerCase();
      if (sub === 'disable' || sub === 'off' || sub === 'حبس' || sub === 'طفي') {
        ctx.config.aiEnabled = false;
        await message.reply('🛑 **تم إيقاف الذكاء الاصطناعي في السيرفر بنجاح.**');
      } else if (sub === 'all' || sub === 'شعل' || sub === 'on') {
        ctx.config.aiEnabled = true;
        ctx.config.allowedAiChannelId = null;
        await message.reply('🟢 **تم تفعيل الذكاء الاصطناعي في كل قنوات السيرفر.**');
      } else {
        ctx.config.aiEnabled = true;
        ctx.config.allowedAiChannelId = message.channel.id;
        await message.reply(`🎯 **تم قفل الذكاء الاصطناعي ليعمل في هذه القناة فقط (<#${message.channel.id}>).**`);
      }
    },
  },
  {
    name: 'nuke',
    description: '💥 إعادة تدوير وتطهير الشات بالكامل ومسح كل الرسائل القديمة (للسطاف)',
    category: 'moderation',
    executeSlash: async (interaction) => {
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: '❌ لا تملك صلاحية `Manage Channels`!', ephemeral: true });
      }
      const channel = interaction.channel as TextChannel;
      const position = channel.position;
      const newChannel = await channel.clone();
      await channel.delete();
      await newChannel.setPosition(position);
      await newChannel.send('💥 **تم تطهير الشات بنجاح وإعادة تدويره!** https://i.imgur.com/bvh29zT.png');
    },
    executeText: async (message) => {
      if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('❌ لا تملك صلاحية `Manage Channels`!');
      }
      const channel = message.channel as TextChannel;
      const position = channel.position;
      const newChannel = await channel.clone();
      await channel.delete();
      await newChannel.setPosition(position);
      await newChannel.send('💥 **تم تصفير وتطهير الشات بنجاح!**');
    },
  },

  // ==================== 5. SERVER UTILITIES & INFO (28-37) ====================
  {
    name: 'serverinfo',
    description: 'عرض معلومات تفصيلية عن السيرفر',
    category: 'utility',
    executeSlash: async (interaction) => {
      const g = interaction.guild!;
      const embed = new EmbedBuilder()
        .setColor(0x6366f1)
        .setTitle(`🏰 معلومات السيرفر: ${g.name}`)
        .setThumbnail(g.iconURL() || 'https://i.imgur.com/bvh29zT.png')
        .addFields(
          { name: '👑 مالك السيرفر', value: `<@${g.ownerId}>`, inline: true },
          { name: '👥 عدد الأعضاء', value: `${g.memberCount}`, inline: true },
          { name: '💬 عدد القنوات', value: `${g.channels.cache.size}`, inline: true },
          { name: '🎖️ عدد الرتب', value: `${g.roles.cache.size}`, inline: true },
          { name: '📅 تاريخ الإنشاء', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '🆔 معرف السيرفر', value: `\`${g.id}\``, inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    },
    executeText: async (message) => {
      const g = message.guild!;
      const embed = new EmbedBuilder()
        .setColor(0x6366f1)
        .setTitle(`🏰 معلومات السيرفر: ${g.name}`)
        .setThumbnail(g.iconURL() || 'https://i.imgur.com/bvh29zT.png')
        .addFields(
          { name: '👑 مالك السيرفر', value: `<@${g.ownerId}>`, inline: true },
          { name: '👥 عدد الأعضاء', value: `${g.memberCount}`, inline: true },
          { name: '💬 عدد القنوات', value: `${g.channels.cache.size}`, inline: true },
          { name: '🎖️ عدد الرتب', value: `${g.roles.cache.size}`, inline: true },
          { name: '📅 تاريخ الإنشاء', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true }
        );
      await message.reply({ embeds: [embed] });
    },
  },
  {
    name: 'userinfo',
    description: 'عرض معلومات حساب العضو وتاريخ انضمامه',
    category: 'utility',
    options: [{ name: 'user', description: 'العضو المطلوب', type: 6, required: false }],
    executeSlash: async (interaction) => {
      const targetUser = interaction.options.getUser('user') || interaction.user;
      const targetMember = interaction.guild!.members.cache.get(targetUser.id);
      const embed = new EmbedBuilder()
        .setColor(0x3b82f6)
        .setTitle(`👤 بطاقة العضو: ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: '🆔 المعرف', value: `\`${targetUser.id}\``, inline: true },
          { name: '📅 تاريخ إنشاء الحساب', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '📥 تاريخ الانضمام للسيرفر', value: targetMember?.joinedTimestamp ? `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>` : 'غير متاح', inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    },
    executeText: async (message) => {
      const targetMember = message.mentions.members?.first() || message.member!;
      const u = targetMember.user;
      const embed = new EmbedBuilder()
        .setColor(0x3b82f6)
        .setTitle(`👤 بطاقة العضو: ${u.username}`)
        .setThumbnail(u.displayAvatarURL())
        .addFields(
          { name: '🆔 المعرف', value: `\`${u.id}\``, inline: true },
          { name: '📅 تاريخ الحساب', value: `<t:${Math.floor(u.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '📥 تاريخ الانضمام', value: targetMember.joinedTimestamp ? `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>` : 'غير متاح', inline: true }
        );
      await message.reply({ embeds: [embed] });
    },
  },
  {
    name: 'avatar',
    description: 'عرض وتحميل صورة الحساب لأي عضو',
    category: 'utility',
    options: [{ name: 'user', description: 'العضو المطلوب', type: 6, required: false }],
    executeSlash: async (interaction) => {
      const target = interaction.options.getUser('user') || interaction.user;
      const embed = new EmbedBuilder()
        .setColor(0xec4899)
        .setTitle(`🖼️ صورة حساب: ${target.username}`)
        .setImage(target.displayAvatarURL({ size: 1024 }))
        .setFooter({ text: `طلب بواسطة: ${interaction.user.username}` });
      await interaction.reply({ embeds: [embed] });
    },
    executeText: async (message) => {
      const target = message.mentions.users.first() || message.author;
      const embed = new EmbedBuilder()
        .setColor(0xec4899)
        .setTitle(`🖼️ صورة حساب: ${target.username}`)
        .setImage(target.displayAvatarURL({ size: 1024 }))
        .setFooter({ text: `طلب بواسطة: ${message.author.username}` });
      await message.reply({ embeds: [embed] });
    },
  },
  {
    name: 'banner',
    description: 'عرض بنر البوت أو الرومات الصوتية',
    category: 'utility',
    executeSlash: async (interaction, ctx) => {
      const banner = ctx.config.bannerUrl || 'https://i.imgur.com/bvh29zT.png';
      const embed = new EmbedBuilder()
        .setColor(0x00e5ff)
        .setTitle('🎨 بنر نظام الرومات الصوتية')
        .setImage(banner);
      await interaction.reply({ embeds: [embed] });
    },
    executeText: async (message, _, ctx) => {
      const banner = ctx.config.bannerUrl || 'https://i.imgur.com/bvh29zT.png';
      const embed = new EmbedBuilder()
        .setColor(0x00e5ff)
        .setTitle('🎨 بنر نظام الرومات الصوتية')
        .setImage(banner);
      await message.reply({ embeds: [embed] });
    },
  },
  {
    name: 'botinfo',
    description: 'معلومات تقنية شاملة عن البوت وحالة الاستضافة 24/7',
    category: 'utility',
    executeSlash: async (interaction, ctx) => {
      const embed = new EmbedBuilder()
        .setColor(0x00e5ff)
        .setTitle('🤖 بطاقة معلومات البوت التقنية')
        .addFields(
          { name: '🏷️ اسم البوت', value: `${ctx.config.botTag}`, inline: true },
          { name: '🟢 حالة الاستضافة', value: 'تعمل 24/7 سحابياً', inline: true },
          { name: '🏓 الاستجابة (Ping)', value: `${interaction.client.ws.ping}ms`, inline: true },
          { name: '🧠 الذكاء الاصطناعي', value: 'Google Gemini 3.8 Flash (دارجة جزائرية)', inline: true },
          { name: '🔊 الرومات النشطة', value: `${Object.keys(ctx.activeTempVCs).length}`, inline: true },
          { name: '👑 مالك البوت', value: `<@${ctx.config.ownerUserId}>`, inline: true }
        )
        .setFooter({ text: 'AlphaGenerator Bot System' });
      await interaction.reply({ embeds: [embed] });
    },
    executeText: async (message, _, ctx) => {
      const embed = new EmbedBuilder()
        .setColor(0x00e5ff)
        .setTitle('🤖 بطاقة معلومات البوت التقنية')
        .addFields(
          { name: '🏷️ اسم البوت', value: `${ctx.config.botTag}`, inline: true },
          { name: '🟢 حالة الاستضافة', value: 'تعمل 24/7 سحابياً', inline: true },
          { name: '🏓 الاستجابة (Ping)', value: `${message.client.ws.ping}ms`, inline: true },
          { name: '🧠 الذكاء الاصطناعي', value: 'Google Gemini 3.8 Flash (دارجة جزائرية)', inline: true },
          { name: '🔊 الرومات النشطة', value: `${Object.keys(ctx.activeTempVCs).length}`, inline: true }
        );
      await message.reply({ embeds: [embed] });
    },
  },
  {
    name: 'uptime',
    description: 'عرض مدة تشغيل البوت المستمرة دون انقطاع',
    category: 'utility',
    executeSlash: async (interaction) => {
      const totalSec = Math.floor(process.uptime());
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      await interaction.reply(`⏱️ **مدة تشغيل البوت:** \`${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية\` (متصل 24/7)`);
    },
    executeText: async (message) => {
      const totalSec = Math.floor(process.uptime());
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      await message.reply(`⏱️ **مدة تشغيل البوت:** \`${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية\` (متصل 24/7)`);
    },
  },
  {
    name: 'roles',
    description: 'عرض قائمة رتب السيرفر',
    category: 'utility',
    executeSlash: async (interaction) => {
      const roles = interaction.guild!.roles.cache
        .filter((r) => r.name !== '@everyone')
        .map((r) => r.name)
        .slice(0, 25)
        .join(', ');
      await interaction.reply(`🎖️ **أهم رتب السيرفر (${interaction.guild!.roles.cache.size}):**\n${roles}`);
    },
    executeText: async (message) => {
      const roles = message.guild!.roles.cache
        .filter((r) => r.name !== '@everyone')
        .map((r) => r.name)
        .slice(0, 25)
        .join(', ');
      await message.reply(`🎖️ **أهم رتب السيرفر (${message.guild!.roles.cache.size}):**\n${roles}`);
    },
  },
  {
    name: 'emojis',
    description: 'عرض إيموجيات السيرفر الخاصة',
    category: 'utility',
    executeSlash: async (interaction) => {
      const emojis = interaction.guild!.emojis.cache.map((e) => e.toString()).slice(0, 30).join(' ');
      await interaction.reply(`😀 **إيموجيات السيرفر (${interaction.guild!.emojis.cache.size}):**\n${emojis || 'لا توجد إيموجيات مخصصة'}`);
    },
    executeText: async (message) => {
      const emojis = message.guild!.emojis.cache.map((e) => e.toString()).slice(0, 30).join(' ');
      await message.reply(`😀 **إيموجيات السيرفر (${message.guild!.emojis.cache.size}):**\n${emojis || 'لا توجد إيموجيات مخصصة'}`);
    },
  },
  {
    name: 'calc',
    description: 'آلة حاسبة سريعة لإجراء العمليات الحسابية',
    category: 'utility',
    options: [{ name: 'expression', description: 'العملية مثل 25 * 4', type: 3, required: true }],
    executeSlash: async (interaction) => {
      const exp = interaction.options.getString('expression', true);
      try {
        // Safe evaluation without eval
        const sanitized = exp.replace(/[^0-9+\-*/().]/g, '');
        const res = Function(`'use strict'; return (${sanitized})`)();
        await interaction.reply(`🧮 نتيجة الحساب: \`${sanitized}\` = **${res}**`);
      } catch {
        await interaction.reply({ content: '❌ عملية حسابية غير صالحة!', ephemeral: true });
      }
    },
    executeText: async (message, args) => {
      const exp = args.join('');
      try {
        const sanitized = exp.replace(/[^0-9+\-*/().]/g, '');
        const res = Function(`'use strict'; return (${sanitized})`)();
        await message.reply(`🧮 نتيجة الحساب: \`${sanitized}\` = **${res}**`);
      } catch {
        await message.reply('❌ عملية حسابية غير صالحة! مثال: `!calc 150 * 3`');
      }
    },
  },
  {
    name: 'poll',
    description: 'إنشاء تصويت سريع للأعضاء مع التفاعل بنعم / لا',
    category: 'utility',
    options: [{ name: 'question', description: 'سؤال التصويت', type: 3, required: true }],
    executeSlash: async (interaction) => {
      const q = interaction.options.getString('question', true);
      const embed = new EmbedBuilder()
        .setColor(0x8b5cf6)
        .setTitle('📊 تصويت جديد')
        .setDescription(`**${q}**\n\nصوت بالضغط على التفاعلات أدناه:`)
        .setFooter({ text: `أنشئ بواسطة: ${interaction.user.username}` });
      const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
      await msg.react('✅');
      await msg.react('❌');
    },
    executeText: async (message, args) => {
      const q = args.join(' ');
      if (!q) return message.reply('يرجى كتابة سؤال التصويت: `!poll هل تحبون المسابقات؟`');
      const embed = new EmbedBuilder()
        .setColor(0x8b5cf6)
        .setTitle('📊 تصويت جديد')
        .setDescription(`**${q}**\n\nصوت بالضغط على التفاعلات أدناه:`)
        .setFooter({ text: `أنشئ بواسطة: ${message.author.username}` });
      const msg = await message.channel.send({ embeds: [embed] });
      await msg.react('✅');
      await msg.react('❌');
    },
  },

  // ==================== 6. FUN & COMMUNITY (38-44) ====================
  {
    name: 'xo',
    description: 'بدء تحدي لعبة XO تفاعلية في الشات',
    category: 'fun',
    executeSlash: async (interaction) => {
      await interaction.reply({
        content: `🎮 **تحدي XO!** يمكنكم أيضاً بدء لعبة XO عبر زرار (🎮 XO Game) الموجود في لوحة تحكم الروم الصوتي! للتحدي المباشر، اكتب: \`!xo @user\``,
      });
    },
    executeText: async (message) => {
      await message.reply(
        `🎮 **تحدي XO!** يمكنكم بدء لعبة XO واللعب مع أصدقائكم عبر زر (🎮 XO Game) بلوحة تحكم الروم الصوتي!`
      );
    },
  },
  {
    name: 'roll',
    description: 'رمي النرد العشوائي (1 إلى 6)',
    category: 'fun',
    executeSlash: async (interaction) => {
      const n = Math.floor(Math.random() * 6) + 1;
      await interaction.reply(`🎲 رقم النرد طلع: **${n}**`);
    },
    executeText: async (message) => {
      const n = Math.floor(Math.random() * 6) + 1;
      await message.reply(`🎲 رقم النرد طلع: **${n}**`);
    },
  },
  {
    name: 'coin',
    description: 'قرعة الوجه أو الظهر (Pile أو Face)',
    category: 'fun',
    executeSlash: async (interaction) => {
      const res = Math.random() > 0.5 ? 'وجه (Face / نخلة)' : 'ظهر (Pile / رقم)';
      await interaction.reply(`🪙 نتيجة القرعة: **${res}**`);
    },
    executeText: async (message) => {
      const res = Math.random() > 0.5 ? 'وجه (Face / نخلة)' : 'ظهر (Pile / رقم)';
      await message.reply(`🪙 نتيجة القرعة: **${res}**`);
    },
  },
  {
    name: 'love',
    description: 'مقياس المحبة الأخوية في الله بين عضوين',
    category: 'fun',
    options: [{ name: 'user', description: 'العضو المطلوب', type: 6, required: true }],
    executeSlash: async (interaction) => {
      const target = interaction.options.getUser('user', true);
      const percent = Math.floor(Math.random() * 40) + 60; // always positive fraternity
      await interaction.reply(`❤️ نسبة المحبة والأخوة في الله بينك وبين <@${target.id}> هي: **${percent}%**! والمؤمنون إخوة.`);
    },
    executeText: async (message) => {
      const target = message.mentions.users.first();
      if (!target) return message.reply('منشن العضو: `!love @user`');
      const percent = Math.floor(Math.random() * 40) + 60;
      await message.reply(`❤️ نسبة الأخوة والمحبة في الله بينك وبين <@${target.id}> هي: **${percent}%**! والمؤمنون إخوة.`);
    },
  },
  {
    name: 'rps',
    description: 'لعبة حجرة ورقة مقص ضد البوت',
    category: 'fun',
    options: [
      {
        name: 'choice',
        description: 'اختر: حجرة أو ورقة أو مقص',
        type: 3,
        required: true,
        choices: [
          { name: 'حجرة 🪨', value: 'حجرة' },
          { name: 'ورقة 📄', value: 'ورقة' },
          { name: 'مقص ✂️', value: 'مقص' },
        ],
      },
    ],
    executeSlash: async (interaction) => {
      const userChoice = interaction.options.getString('choice', true);
      const choices = ['حجرة', 'ورقة', 'مقص'];
      const botChoice = choices[Math.floor(Math.random() * 3)];
      let result = 'تعادلنا يا خويا!';
      if (
        (userChoice === 'حجرة' && botChoice === 'مقص') ||
        (userChoice === 'ورقة' && botChoice === 'حجرة') ||
        (userChoice === 'مقص' && botChoice === 'ورقة')
      ) {
        result = '🎉 صحيت خويا راك غلبتني!';
      } else if (userChoice !== botChoice) {
        result = '😎 أنا اللي ربحتك هاذ المرة، معليش خيرها في غيرها!';
      }
      await interaction.reply(`أنت اخترت: **${userChoice}** | أنا اخترت: **${botChoice}**\n\n> ${result}`);
    },
    executeText: async (message, args) => {
      const userChoice = args[0];
      const valid = ['حجرة', 'ورقة', 'مقص'];
      if (!valid.includes(userChoice)) {
        return message.reply('اكتب اختيارك: `!rps حجرة` أو `!rps ورقة` أو `!rps مقص`');
      }
      const botChoice = valid[Math.floor(Math.random() * 3)];
      let result = 'تعادلنا يا خويا!';
      if (
        (userChoice === 'حجرة' && botChoice === 'مقص') ||
        (userChoice === 'ورقة' && botChoice === 'حجرة') ||
        (userChoice === 'مقص' && botChoice === 'ورقة')
      ) {
        result = '🎉 صحيت خويا راك ربحتني!';
      } else if (userChoice !== botChoice) {
        result = '😎 أنا اللي ربحتك هاذ المرة يا خويا!';
      }
      await message.reply(`أنت: **${userChoice}** | البوت: **${botChoice}**\n\n> ${result}`);
    },
  },
  {
    name: 'choose',
    description: 'طلب من البوت الاختيار بالعدل بين أمرين أو خيارات متعددة',
    category: 'fun',
    options: [{ name: 'options', description: 'اكتب الخيارات مفصولة بفواصل', type: 3, required: true }],
    executeSlash: async (interaction) => {
      const opts = interaction.options.getString('options', true).split(/[,،]/).map((s) => s.trim()).filter(Boolean);
      const pick = opts[Math.floor(Math.random() * opts.length)] || 'توكل على ربي';
      await interaction.reply(`🤔 بعد التفكير والاستشارة، نخيرلك: **${pick}** وتوكل على الله!`);
    },
    executeText: async (message, args) => {
      const raw = args.join(' ');
      const opts = raw.split(/[,،]/).map((s) => s.trim()).filter(Boolean);
      if (opts.length < 2) return message.reply('اكتب خيارين على الأقل مفصولين بفاصلة. مثال: `!choose بيتزا, شاورما`');
      const pick = opts[Math.floor(Math.random() * opts.length)];
      await message.reply(`🤔 بعد التفكير، نخيرلك: **${pick}** وتوكل على الله يا خويا!`);
    },
  },
  {
    name: 'joke',
    description: 'نكتة خفيفة وظريفة ومحترمة',
    category: 'fun',
    executeSlash: async (interaction) => {
      const jokes = [
        'واحد شرى سيارة جديدة، ناض الصباح لقا الميكانيكي كاتبلو "مبروك عليك، لعقوبة للفيزيتة" 😂',
        'الأستاذ قال للتلميذ: واش تعريف الكسل؟ قالو التلميذ: الكسل هو هذا.. وما كتب والو في الورقة! 🤣',
        'واحد حَب يجرب ريجيم قاسي، دار الرياضة 5 دقائق وقال لروحو: "نستاهل عليها كسكروت شاورما دبل فرماج" 🥖🧀',
      ];
      await interaction.reply(jokes[Math.floor(Math.random() * jokes.length)]);
    },
    executeText: async (message) => {
      const jokes = [
        'واحد شرى سيارة جديدة، ناض الصباح لقا الميكانيكي كاتبلو "مبروك عليك، لعقوبة للفيزيتة" 😂',
        'الأستاذ قال للتلميذ: واش تعريف الكسل؟ قالو التلميذ: الكسل هو هذا.. وما كتب والو في الورقة! 🤣',
        'واحد حَب يجرب ريجيم قاسي، دار الرياضة 5 دقائق وقال لروحو: "نستاهل عليها كسكروت شاورما دبل فرماج" 🥖🧀',
      ];
      await message.reply(jokes[Math.floor(Math.random() * jokes.length)]);
    },
  },

  // ==================== 7. MODERATION & SERVER MANAGEMENT (45-52) ====================
  {
    name: 'clear',
    description: 'مسح وحذف عدد من الرسائل في القناة (للإشراف)',
    category: 'moderation',
    options: [{ name: 'amount', description: 'العدد (1-100)', type: 4, required: true }],
    executeSlash: async (interaction) => {
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return interaction.reply({ content: '❌ لا تملك صلاحية `Manage Messages`!', ephemeral: true });
      }
      const count = Math.min(Math.max(interaction.options.getInteger('amount', true), 1), 100);
      const textChannel = interaction.channel as TextChannel;
      const deleted = await textChannel.bulkDelete(count, true);
      await interaction.reply({ content: `🧹 تم مسح **${deleted.size}** رسالة بنجاح!`, ephemeral: true });
    },
    executeText: async (message, args) => {
      if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return message.reply('❌ لا تملك صلاحية `Manage Messages`!');
      }
      const count = Math.min(Math.max(parseInt(args[0] || '5', 10), 1), 100);
      const textChannel = message.channel as TextChannel;
      await message.delete().catch(() => {});
      const deleted = await textChannel.bulkDelete(count, true);
      const reply = await message.channel.send(`🧹 تم مسح **${deleted.size}** رسالة بنجاح!`);
      setTimeout(() => reply.delete().catch(() => {}), 4000);
    },
  },
  {
    name: 'kick',
    description: 'طرد عضو من السيرفر (للإدارة فقط)',
    category: 'moderation',
    options: [
      { name: 'user', description: 'العضو المراد طرده', type: 6, required: true },
      { name: 'reason', description: 'السبب', type: 3, required: false },
    ],
    executeSlash: async (interaction) => {
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return interaction.reply({ content: '❌ لا تملك صلاحية `Kick Members`!', ephemeral: true });
      }
      const targetUser = interaction.options.getUser('user', true);
      const reason = interaction.options.getString('reason') || 'طرد بواسطة الإدارة';
      const targetMember = interaction.guild!.members.cache.get(targetUser.id);
      if (!targetMember) return interaction.reply({ content: 'العضو غير موجود بالسيرفر!', ephemeral: true });
      await targetMember.kick(reason);
      await interaction.reply(`👢 تم طرد <@${targetUser.id}> من السيرفر بنجاح.`);
    },
    executeText: async (message, args) => {
      if (!message.member?.permissions.has(PermissionFlagsBits.KickMembers)) {
        return message.reply('❌ لا تملك صلاحية `Kick Members`!');
      }
      const target = message.mentions.members?.first();
      if (!target) return message.reply('منشن العضو المراد طرده: `!kick @user`');
      const reason = args.slice(1).join(' ') || 'طرد بواسطة الإدارة';
      await target.kick(reason);
      await message.reply(`👢 تم طرد <@${target.id}> من السيرفر بنجاح.`);
    },
  },
  {
    name: 'ban',
    description: 'حظر عضو نهائياً من السيرفر (للإدارة فقط)',
    category: 'moderation',
    options: [
      { name: 'user', description: 'العضو المراد حظره', type: 6, required: true },
      { name: 'reason', description: 'السبب', type: 3, required: false },
    ],
    executeSlash: async (interaction) => {
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({ content: '❌ لا تملك صلاحية `Ban Members`!', ephemeral: true });
      }
      const targetUser = interaction.options.getUser('user', true);
      const reason = interaction.options.getString('reason') || 'حظر بواسطة الإدارة';
      await interaction.guild!.members.ban(targetUser.id, { reason });
      await interaction.reply(`🔨 تم حظر <@${targetUser.id}> من السيرفر.`);
    },
    executeText: async (message, args) => {
      if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply('❌ لا تملك صلاحية `Ban Members`!');
      }
      const target = message.mentions.users.first();
      if (!target) return message.reply('منشن العضو المراد حظره: `!ban @user`');
      const reason = args.slice(1).join(' ') || 'حظر بواسطة الإدارة';
      await message.guild!.members.ban(target.id, { reason });
      await message.reply(`🔨 تم حظر <@${target.id}> من السيرفر.`);
    },
  },
  {
    name: 'unban',
    description: 'فك الحظر عن شخص عبر معرفه ID',
    category: 'moderation',
    options: [{ name: 'userid', description: 'معرف الحساب ID', type: 3, required: true }],
    executeSlash: async (interaction) => {
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({ content: '❌ لا تملك صلاحية `Ban Members`!', ephemeral: true });
      }
      const userId = interaction.options.getString('userid', true);
      await interaction.guild!.members.unban(userId);
      await interaction.reply(`⭕ تم فك الحظر عن الحساب صاحب المعرف: \`${userId}\``);
    },
    executeText: async (message, args) => {
      if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply('❌ لا تملك صلاحية `Ban Members`!');
      }
      const userId = args[0];
      if (!userId) return message.reply('اكتب الـ ID: `!unban 1054739108905361469`');
      await message.guild!.members.unban(userId);
      await message.reply(`⭕ تم فك الحظر عن الحساب صاحب المعرف: \`${userId}\``);
    },
  },
  {
    name: 'lockchannel',
    description: 'قفل الشات الكتابي ومنع الأعضاء من الكتابة فيه',
    category: 'moderation',
    executeSlash: async (interaction) => {
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: '❌ لا تملك صلاحية `Manage Channels`!', ephemeral: true });
      }
      const channel = interaction.channel as TextChannel;
      await channel.permissionOverwrites.edit(interaction.guild!.id, { SendMessages: false });
      await interaction.reply('🔒 تم قفل هذه القناة الكتابية ومنع الإرسال فيها مؤقتاً.');
    },
    executeText: async (message) => {
      if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('❌ لا تملك صلاحية `Manage Channels`!');
      }
      const channel = message.channel as TextChannel;
      await channel.permissionOverwrites.edit(message.guild!.id, { SendMessages: false });
      await message.reply('🔒 تم قفل هذه القناة الكتابية ومنع الإرسال فيها مؤقتاً.');
    },
  },
  {
    name: 'unlockchannel',
    description: 'فتح الشات الكتابي والسماح للجميع بالكتابة',
    category: 'moderation',
    executeSlash: async (interaction) => {
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: '❌ لا تملك صلاحية `Manage Channels`!', ephemeral: true });
      }
      const channel = interaction.channel as TextChannel;
      await channel.permissionOverwrites.edit(interaction.guild!.id, { SendMessages: true });
      await interaction.reply('🔓 تم فتح القناة الكتابية والسماح للجميع بالمحادثة.');
    },
    executeText: async (message) => {
      if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('❌ لا تملك صلاحية `Manage Channels`!');
      }
      const channel = message.channel as TextChannel;
      await channel.permissionOverwrites.edit(message.guild!.id, { SendMessages: true });
      await message.reply('🔓 تم فتح القناة الكتابية والسماح للجميع بالمحادثة.');
    },
  },
  {
    name: 'slowmode',
    description: 'تحديد وقت الانتظار البطيء (Slowmode) في الشات',
    category: 'moderation',
    options: [{ name: 'seconds', description: 'الثواني (0 لتعطيله)', type: 4, required: true }],
    executeSlash: async (interaction) => {
      const member = interaction.member as GuildMember;
      if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: '❌ لا تملك صلاحية `Manage Channels`!', ephemeral: true });
      }
      const sec = interaction.options.getInteger('seconds', true);
      const channel = interaction.channel as TextChannel;
      await channel.setRateLimitPerUser(sec);
      await interaction.reply(`⏳ تم ضبط وضع السلومود إلى: **${sec} ثواني**`);
    },
    executeText: async (message, args) => {
      if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('❌ لا تملك صلاحية `Manage Channels`!');
      }
      const sec = parseInt(args[0] || '0', 10);
      const channel = message.channel as TextChannel;
      await channel.setRateLimitPerUser(sec);
      await message.reply(`⏳ تم ضبط السلومود إلى: **${sec} ثواني**`);
    },
  },
  {
    name: 'help',
    description: 'عرض قائمة الأوامر الكاملة الـ 50+ منظمة حسب الأقسام',
    category: 'utility',
    executeSlash: async (interaction) => {
      const embed = new EmbedBuilder()
        .setColor(0x00e5ff)
        .setTitle('📜 دليل أوامر البوت الشامل (50+ أمر)')
        .setDescription(
          `مرحباً بك! البوت مزود بنظام الرومات الصوتية بالأزرار، الذكاء الاصطناعي الجزائري، وأقوى أدوات الإشراف والتحكم:\n\n` +
          `🧠 **الذكاء الاصطناعي الجزائري**\n` +
          `• \`/ai [سؤالك]\` أو منشن البوت في أي شات وتكلم معاه بالدارجة مباشرة!\n` +
          `• \`/aichannel\` للسطاف/الأونر (قفل أو تشغيل الذكاء في قناة معينة)\n` +
          `• \`/nasiha\` (نصيحة أخوية بالدارجة)، \`/tafsir\` (تفسير وفائدة)\n\n` +
          `🛡️ **أدوات الإشراف والسطاف (Moderation)**\n` +
          `• \`/lockchat\` (بلع الشات) • \`/unlockchat\` (فتح الشات)\n` +
          `• \`/mute\` (كتم/تايم أوت) • \`/unmute\` (فك الكتم)\n` +
          `• \`/kick\` (طرد) • \`/ban\` (حظر) • \`/unban\` (فك الحظر)\n` +
          `• \`/warn\` (إنذار رسمي) • \`/clear\` (مسح رسائل) • \`/nuke\` (تطهير الشات) • \`/slowmode\`\n\n` +
          `🌿 **الأوامر الإسلامية المباركة**\n` +
          `• \`/quran\` • \`/hadith\` • \`/dhikr\` • \`/prayer\` • \`/dua\` • \`/istighfar\` • \`/salat\` • \`/friday\` • \`/kahf\`\n\n` +
          `🇩🇿 **أمثال وتراث جزائري**\n` +
          `• \`/amthal\` • \`/dz\` • \`/tahia\` • \`/marhaba\`\n\n` +
          `🔊 **الرومات الصوتية التلقائية (Temp VC)**\n` +
          `• تحكم كامل وفوري بـ 15 زراً تفاعلياً داخل قناة التحكم\n` +
          `• أوامر: \`/setup\` • \`/stay\` • \`/leave\`\n\n` +
          `🛠️ **أدوات ومعلومات السيرفر**\n` +
          `• \`/serverinfo\` • \`/userinfo\` • \`/avatar\` • \`/botinfo\` • \`/uptime\` • \`/roles\` • \`/emojis\` • \`/calc\` • \`/poll\` • \`/say\` • \`/ping\`\n\n` +
          `🎮 **ألعاب وترفيه**\n` +
          `• \`/xo\` • \`/roll\` • \`/coin\` • \`/love\` • \`/rps\` • \`/choose\` • \`/joke\``
        )
        .setFooter({ text: 'جميع الأوامر تعمل بالـ Slash Commands (/) أو بالبادئة (!) واختصارات الدارجة' });
      await interaction.reply({ embeds: [embed] });
    },
    executeText: async (message) => {
      const embed = new EmbedBuilder()
        .setColor(0x00e5ff)
        .setTitle('📜 دليل أوامر البوت الشامل (50+ أمر)')
        .setDescription(
          `مرحباً بك! البوت مزود بنظام الرومات الصوتية والذكاء الاصطناعي الجزائري وأدوات السطاف:\n\n` +
          `🧠 **الذكاء الاصطناعي الجزائري**\n` +
          `• \`!ai [سؤالك]\` أو منشن البوت في أي شات وسولف معاه مباشرة!\n` +
          `• \`!aichannel [all/off/set]\` (أمر تحكم السطاف في قناة الذكاء)\n` +
          `• \`!nasiha\` ، \`!tafsir\`\n\n` +
          `🛡️ **الإشراف والسطاف (مع الاختصارات الدارجة)**\n` +
          `• \`!بلع\` أو \`!lockchat\` (قفل الشات)\n` +
          `• \`!حل\` أو \`!unlockchat\` (فتح الشات)\n` +
          `• \`!اسكت\` أو \`!mute @user [دقيقة]\` (كتم/تايم أوت)\n` +
          `• \`!تكلم\` أو \`!unmute @user\` (فك الكتم)\n` +
          `• \`!طرد\` أو \`!kick @user\`\n` +
          `• \`!بند\` أو \`!ban @user\`\n` +
          `• \`!تحذير\` أو \`!warn @user [سبب]\`\n` +
          `• \`!مسح\` أو \`!clear [عدد]\` • \`!nuke\` • \`!slowmode [ثواني]\`\n\n` +
          `🌿 **الأوامر الإسلامية**\n` +
          `• \`!quran\` • \`!hadith\` • \`!dhikr\` • \`!prayer\` • \`!dua\` • \`!istighfar\` • \`!salat\` • \`!friday\` • \`!kahf\`\n\n` +
          `🇩🇿 **التراث الجزائري**\n` +
          `• \`!amthal\` • \`!dz\` • \`!tahia\` • \`!marhaba\`\n\n` +
          `🛠️ **الأدوات والمعلومات**\n` +
          `• \`!serverinfo\` • \`!userinfo\` • \`!avatar\` • \`!botinfo\` • \`!uptime\` • \`!calc\` • \`!poll\` • \`!9ol\` • \`!ping\`\n\n` +
          `🎮 **الألعاب**\n` +
          `• \`!roll\` • \`!coin\` • \`!love\` • \`!rps\` • \`!choose\` • \`!joke\``
        )
        .setFooter({ text: 'جميع الأوامر تعمل بالسلاش (/) أو البادئة (!)' });
      await message.reply({ embeds: [embed] });
    },
  },
];

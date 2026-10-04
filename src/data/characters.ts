import { CharacterItem, GradeId } from '../types/chinese';

export const INITIAL_CHARACTERS: Record<GradeId, CharacterItem[]> = {
  g1: [
    {
      id: 'c-g1-1',
      char: '日',
      pinyin: 'rì',
      radical: '日',
      strokeCount: 4,
      strokeOrderHint: '竖、横折、横、横',
      strokeOrderSteps: ['丨', '𠃍', '一', '一'],
      structure: '独体字',
      meanings: ['太阳', '一天，日子', '时间'],
      phrases: ['日光', '红日', '日子', '日积月累'],
      exampleSentence: '一轮红日从东方冉冉升起。',
      mnemonic: '圆圆太阳当中亮，一横光芒透出来。',
      phoneticTrap: {
        type: 'flat_retroflex',
        label: '翘舌音易错（r 辅音）',
        tip: '“日”为翘舌音 rì，发音时舌尖上卷靠近硬腭前部，切忌读成半开元音 yì。',
        contrastPair: { correctWord: '红日', confusingWord: '意义', correctPinyin: 'rì', confusingPinyin: 'yì' }
      },
      gradeId: 'g1'
    },
    {
      id: 'c-g1-2',
      char: '月',
      pinyin: 'yuè',
      radical: '月',
      strokeCount: 4,
      strokeOrderHint: '撇、横折钩、横、横',
      strokeOrderSteps: ['丿', '𠃌', '一', '一'],
      structure: '独体字',
      meanings: ['月亮', '计时单位，月份'],
      phrases: ['月亮', '明月', '岁月', '花好月圆'],
      exampleSentence: '弯弯的月儿像小船。',
      mnemonic: '像一弯月牙挂在夜空中。',
      phoneticTrap: {
        type: 'tone',
        label: '撮口呼 üe 读音',
        tip: '“月”音节为 yuè，发音时嘴唇拢圆成小孔，保持撮口圆唇。'
      },
      gradeId: 'g1'
    },
    {
      id: 'c-g1-3',
      char: '水',
      pinyin: 'shuǐ',
      radical: '水',
      strokeCount: 4,
      strokeOrderHint: '竖钩、横撇、撇、捺',
      strokeOrderSteps: ['亅', '㇇', '丿', '㇏'],
      structure: '独体字',
      meanings: ['最常见的无色液体', '江河湖海的通称'],
      phrases: ['流水', '泉水', '山水', '饮水思源'],
      exampleSentence: '清清的泉水哗啦啦地流着。',
      mnemonic: '中间主干成河道，两边浪花飞溅起。',
      phoneticTrap: {
        type: 'flat_retroflex',
        label: '翘舌音易错（sh vs s）',
        tip: '“水”声母为翘舌音 sh，舌尖翘起，注意与平舌音 suǐ（随/髓）区分。',
        contrastPair: { correctWord: '泉水', confusingWord: '骨髓', correctPinyin: 'shuǐ', confusingPinyin: 'suǐ' }
      },
      gradeId: 'g1'
    },
    {
      id: 'c-g1-4',
      char: '山',
      pinyin: 'shān',
      radical: '山',
      strokeCount: 3,
      strokeOrderHint: '竖、竖折、竖',
      strokeOrderSteps: ['丨', '𠃊', '丨'],
      structure: '独体字',
      meanings: ['地面形成的高耸的部分'],
      phrases: ['高山', '青山', '山川', '拔地参天'],
      exampleSentence: '远处的高山连绵起伏。',
      mnemonic: '中间高耸两边低，峰峦起伏三座山。',
      phoneticTrap: {
        type: 'front_nasal',
        label: '前鼻音易错（-an vs -ang）',
        tip: '“山”韵母是前鼻音 an，发音收尾舌尖抵住上齿龈；切莫读成后鼻音 shāng（商/伤）。',
        contrastPair: { correctWord: '高山', confusingWord: '商量', correctPinyin: 'shān', confusingPinyin: 'shāng' }
      },
      gradeId: 'g1'
    }
  ],
  g2: [
    {
      id: 'c-g2-1',
      char: '晨',
      pinyin: 'chén',
      radical: '日',
      strokeCount: 11,
      strokeOrderHint: '上日下辰，先写日，再写横、撇、横、竖提、撇、捺',
      strokeOrderSteps: ['丨', '𠃍', '一', '一', '一', '丿', '一', '𠄌', '丿', '㇏'],
      structure: '上下结构',
      meanings: ['早晨，清晨'],
      phrases: ['晨光', '早晨', '晨曦', '一日之计在于晨'],
      exampleSentence: '清晨的露珠在绿叶上轻轻滚动。',
      mnemonic: '太阳（日）升起在星辰（辰）之后便是清晨。',
      phoneticTrap: {
        type: 'front_nasal',
        label: '前鼻音易错（en vs eng）',
        tip: '重点警示：“晨”为前鼻音 chén，尾音舌尖顶住牙龈！常被误读为后鼻音 chéng（成/城）。',
        contrastPair: { correctWord: '清晨', confusingWord: '长城', correctPinyin: 'chén', confusingPinyin: 'chéng' }
      },
      gradeId: 'g2'
    },
    {
      id: 'c-g2-2',
      char: '碧',
      pinyin: 'bì',
      radical: '石',
      strokeCount: 14,
      strokeOrderHint: '上部左王右白，下部为石',
      strokeOrderSteps: ['一', '一', '丨', '一', '丿', '丨', '𠃍', '一', '一', '一', '丿', '丨', '𠃍', '一'],
      structure: '上下结构',
      meanings: ['青绿色的玉石', '深绿色或浅绿色'],
      phrases: ['碧绿', '碧空', '碧波', '金碧辉煌'],
      exampleSentence: '碧绿的小草探出了嫩绿的脑袋。',
      mnemonic: '王白石坐在一起，化作碧玉一片。',
      gradeId: 'g2'
    },
    {
      id: 'c-g2-3',
      char: '暖',
      pinyin: 'nuǎn',
      radical: '日',
      strokeCount: 13,
      strokeOrderHint: '左日右爰，先写日，再写撇、点、点、撇、横撇、点、横折、横、横、撇、捺',
      strokeOrderSteps: ['丨', '𠃍', '一', '一', '丿', '丶', '丶', '丿', '㇇', '丶', '𠃍', '一', '一'],
      structure: '左右结构',
      meanings: ['温和，温度不冷不热'],
      phrases: ['温暖', '暖和', '暖春', '问寒问暖'],
      exampleSentence: '春风给大地带来了融融的温暖。',
      mnemonic: '有太阳（日）照耀，万物皆感温暖。',
      phoneticTrap: {
        type: 'front_nasal',
        label: '前鼻音及鼻音声母 n',
        tip: '“暖”韵母为前鼻音 uǎn，声母为鼻音 n，切勿读成边音 luǎn（卵）。',
        contrastPair: { correctWord: '温暖', confusingWord: '产卵', correctPinyin: 'nuǎn', confusingPinyin: 'luǎn' }
      },
      gradeId: 'g2'
    }
  ],
  g3: [
    {
      id: 'c-g3-1',
      char: '融',
      pinyin: 'róng',
      radical: '虫',
      strokeCount: 16,
      strokeOrderHint: '左边鬲，右边虫',
      strokeOrderSteps: ['一', '丨', '𠃍', '一', '丨', '𠃍', '一', '丨', '𠃍', '丨', '丨', '𠃍', '一', '丨', '一', '丶'],
      structure: '左右结构',
      meanings: ['冰雪等受热化解', '融合，融洽', '流通'],
      phrases: ['融化', '融洽', '金融', '其乐融融'],
      exampleSentence: '春天来了，冰雪融化，小溪欢快地唱起歌。',
      mnemonic: '炊具热气升腾，融化万物，天地交融。',
      phoneticTrap: {
        type: 'back_nasal',
        label: '后鼻音易错（-ong vs -on）',
        tip: '“融”是标准后鼻音 róng，发音时舌根高抬抵住软腭，鼻腔共鸣要饱满。',
        contrastPair: { correctWord: '融雪', confusingWord: '繁荣', correctPinyin: 'róng', confusingPinyin: 'róng' }
      },
      gradeId: 'g3'
    },
    {
      id: 'c-g3-2',
      char: '燕',
      pinyin: 'yàn',
      radical: '灬',
      strokeCount: 16,
      strokeOrderHint: '上廿，中口北，下四点底',
      strokeOrderSteps: ['一', '丨', '丨', '一', '丨', '𠃍', '一', '丨', '一', '一', '丿', '乚', '丶', '丶', '丶', '丶'],
      structure: '上中下结构',
      meanings: ['鸟类，燕子', '古国名（读 yān）'],
      phrases: ['燕子', '春燕', '劳燕分飞', '莺歌燕舞'],
      exampleSentence: '几只活泼伶俐的小燕子在柳枝间穿梭。',
      mnemonic: '廿为头，口为身，两翼展北，四点尾羽翩翩飞。',
      phoneticTrap: {
        type: 'polyphone',
        label: '多音字辨析（yàn vs yān）',
        tip: '指鸟类（燕子、燕雀）读第四声 yàn；指古国名或地名（燕国、燕山）读第一声 yān。'
      },
      gradeId: 'g3'
    },
    {
      id: 'c-g3-3',
      char: '溪',
      pinyin: 'xī',
      radical: '氵',
      strokeCount: 13,
      strokeOrderHint: '左氵，右奚',
      strokeOrderSteps: ['丶', '丶', '㇀', '丿', '丶', '丶', '丿', '一', '𠄌', '一', '丨', '丿', '丶'],
      structure: '左右结构',
      meanings: ['山间细小水流'],
      phrases: ['小溪', '溪流', '溪水', '曲径通幽'],
      exampleSentence: '清澈的小溪在山谷间潺潺流淌。',
      mnemonic: '三点流水绕山谷，细流汇成溪。',
      gradeId: 'g3'
    }
  ],
  g4: [
    {
      id: 'c-g4-1',
      char: '潮',
      pinyin: 'cháo',
      radical: '氵',
      strokeCount: 15,
      strokeOrderHint: '左边氵，右边朝',
      strokeOrderSteps: ['丶', '丶', '㇀', '十', '日', '十', '月'],
      structure: '左右结构',
      meanings: ['海水涨落', '湿气', '社会动向'],
      phrases: ['潮水', '浪潮', '涨潮', '风起云涌'],
      exampleSentence: '钱塘江大潮犹如万马奔腾，声震天地。',
      mnemonic: '朝阳升起海水涌动为潮。',
      phoneticTrap: {
        type: 'flat_retroflex',
        label: '翘舌音易错（ch vs c）',
        tip: '“潮”是翘舌音 cháo，舌尖翘起接触硬腭，不要误读成平舌音 cáo（曹/槽）。',
        contrastPair: { correctWord: '潮水', confusingWord: '水槽', correctPinyin: 'cháo', confusingPinyin: 'cáo' }
      },
      gradeId: 'g4'
    },
    {
      id: 'c-g4-2',
      char: '屹',
      pinyin: 'yì',
      radical: '山',
      strokeCount: 6,
      strokeOrderHint: '左山右乞，竖、竖折、竖、撇、横、横折弯钩',
      strokeOrderSteps: ['丨', '𠃊', '丨', '丿', '一', '⺄'],
      structure: '左右结构',
      meanings: ['高耸挺立，稳固不可动摇'],
      phrases: ['屹立', '屹然', '巍然屹立'],
      exampleSentence: '雄伟的人民英雄纪念碑巍然屹立在广场中央。',
      mnemonic: '山岭立起，稳如磐石。',
      phoneticTrap: {
        type: 'tone',
        label: '字音辨析（yì vs qǐ）',
        tip: '右半边虽为“乞”，但切莫读成半边音 qǐ，正确读音为第四声 yì。'
      },
      gradeId: 'g4'
    }
  ],
  g5: [
    {
      id: 'c-g5-1',
      char: '鹭',
      pinyin: 'lù',
      radical: '鸟',
      strokeCount: 17,
      strokeOrderHint: '上路下鸟',
      strokeOrderSteps: ['足', '各', '鸟'],
      structure: '上下结构',
      meanings: ['水鸟名，如白鹭'],
      phrases: ['白鹭', '苍鹭', '一行白鹭上青天'],
      exampleSentence: '白鹭是一首精巧的诗，色素配合适宜极了。',
      mnemonic: '水边小路上踱步的洁白水鸟。',
      gradeId: 'g5'
    },
    {
      id: 'c-g5-2',
      char: '韵',
      pinyin: 'yùn',
      radical: '音',
      strokeCount: 13,
      strokeOrderHint: '左音右匀',
      strokeOrderSteps: ['音', '勹', '冫'],
      structure: '左右结构',
      meanings: ['和谐悦耳之声', '诗词押韵', '情致神采'],
      phrases: ['韵味', '风韵', '古韵', '回味无穷'],
      exampleSentence: '这首江南小调富有独特的水乡韵味。',
      mnemonic: '声音匀称有节奏，便生出了动人韵致。',
      phoneticTrap: {
        type: 'front_nasal',
        label: '前鼻音易错（-un vs -ung）',
        tip: '“韵”读 yùn（前鼻音ün），舌尖抵住前齿龈；切莫读成后鼻音 yòng。',
        contrastPair: { correctWord: '韵味', confusingWord: '功用', correctPinyin: 'yùn', confusingPinyin: 'yòng' }
      },
      gradeId: 'g5'
    }
  ],
  g6: [
    {
      id: 'c-g6-1',
      char: '瀑',
      pinyin: 'pù',
      radical: '氵',
      strokeCount: 18,
      strokeOrderHint: '左氵，右暴',
      strokeOrderSteps: ['氵', '日', '共', '氺'],
      structure: '左右结构',
      meanings: ['高处悬垂跌落的水流'],
      phrases: ['瀑布', '飞瀑', '飞流直下'],
      exampleSentence: '黄果树瀑布飞流而下，水雾漫天。',
      mnemonic: '水势暴烈跌落成瀑。',
      phoneticTrap: {
        type: 'polyphone',
        label: '多音字提示（pù vs bào）',
        tip: '指瀑布时读第四声 pù；在“一暴十寒”中与“曝”通假读 bào。'
      },
      gradeId: 'g6'
    },
    {
      id: 'c-g6-2',
      char: '巍',
      pinyin: 'wēi',
      radical: '山',
      strokeCount: 20,
      strokeOrderHint: '上山下魏',
      strokeOrderSteps: ['山', '委', '鬼'],
      structure: '上下结构',
      meanings: ['高大，崇高壮观'],
      phrases: ['巍峨', '巍然', '巍巍中华'],
      exampleSentence: '巍峨的泰山挺立在齐鲁大地上。',
      mnemonic: '山体宏伟如魏阙。',
      gradeId: 'g6'
    }
  ],
  g7: [
    {
      id: 'c-g7-1',
      char: '酝',
      pinyin: 'yùn',
      radical: '酉',
      strokeCount: 11,
      strokeOrderHint: '左酉右云',
      strokeOrderSteps: ['酉', '云'],
      structure: '左右结构',
      meanings: ['酿酒；准备筹划'],
      phrases: ['酝酿', '沉湎', '蓄势待发'],
      exampleSentence: '花香都在微微润湿的空气里酝酿。',
      mnemonic: '酒瓮（酉）蒸腾出香云（云），意为酝酿。',
      phoneticTrap: {
        type: 'front_nasal',
        label: '前鼻音易错（-un vs -ung）',
        tip: '“酝”读 yùn 为前鼻音，发音收尾归音舌尖，勿读成 yòng。'
      },
      gradeId: 'g7'
    },
    {
      id: 'c-g7-2',
      char: '贮',
      pinyin: 'zhù',
      radical: '贝',
      strokeCount: 8,
      strokeOrderHint: '左贝右宁',
      strokeOrderSteps: ['贝', '宁'],
      structure: '左右结构',
      meanings: ['积存，储藏'],
      phrases: ['贮蓄', '贮藏', '贮存', '未雨绸缪'],
      exampleSentence: '把阳光和暖气贮蓄起来，只等春风来唤醒。',
      mnemonic: '贝币藏于安宁之所。',
      phoneticTrap: {
        type: 'flat_retroflex',
        label: '翘舌音易错（zh vs z）',
        tip: '“贮”声母为翘舌音 zhù，注意切忌读成平舌音 zù 或半边音 chù。'
      },
      gradeId: 'g7'
    }
  ],
  g8: [
    {
      id: 'c-g8-1',
      char: '踌',
      pinyin: 'chóu',
      radical: '足',
      strokeCount: 14,
      strokeOrderHint: '左足右寿',
      strokeOrderSteps: ['足', '寿'],
      structure: '左右结构',
      meanings: ['犹豫，徘徊；自得的样子'],
      phrases: ['踌躇', '踌躇满志', '犹豫不决'],
      exampleSentence: '他踌躇了一会，终于决定还是自己送我去。',
      mnemonic: '双脚停驻，思量再三。',
      phoneticTrap: {
        type: 'flat_retroflex',
        label: '翘舌音（ch vs c）',
        tip: '“踌”读 chóu 为翘舌音，常被方言误读为平舌音 cóu。'
      },
      gradeId: 'g8'
    },
    {
      id: 'c-g8-2',
      char: '蹒',
      pinyin: 'pán',
      radical: '足',
      strokeCount: 16,
      strokeOrderHint: '左足右满',
      strokeOrderSteps: ['足', '满'],
      structure: '左右结构',
      meanings: ['腿脚不灵便，走路缓慢摇摆的样子'],
      phrases: ['蹒跚', '步履蹒跚', '老态龙钟'],
      exampleSentence: '我看见他戴着黑布小帽，蹒跚地走到铁道边。',
      mnemonic: '足部吃力，脚步沉重。',
      phoneticTrap: {
        type: 'front_nasal',
        label: '前鼻音易错（-an vs -ang）',
        tip: '“蹒”读 pán 为前鼻音，不要误读为后鼻音 páng。',
        contrastPair: { correctWord: '步履蹒跚', confusingWord: '彷徨', correctPinyin: 'pán', confusingPinyin: 'páng' }
      },
      gradeId: 'g8'
    }
  ],
  g9: [
    {
      id: 'c-g9-1',
      char: '砥',
      pinyin: 'dǐ',
      radical: '石',
      strokeCount: 10,
      strokeOrderHint: '左石右氐',
      strokeOrderSteps: ['石', '氐'],
      structure: '左右结构',
      meanings: ['细磨刀石；磨砺，支撑'],
      phrases: ['砥砺', '中流砥柱', '砥柱中流'],
      exampleSentence: '青年人应当在风浪中砥砺品质，勇做时代的先锋。',
      mnemonic: '坚石如底，力挽狂澜。',
      phoneticTrap: {
        type: 'tone',
        label: '字音声调（dǐ 第三声）',
        tip: '“砥”读第三声 dǐ，不要读成第四声 dì 或第二声 dí。'
      },
      gradeId: 'g9'
    },
    {
      id: 'c-g9-2',
      char: '豁',
      pinyin: 'huò',
      radical: '谷',
      strokeCount: 17,
      strokeOrderHint: '左害右谷',
      strokeOrderSteps: ['害', '谷'],
      structure: '左右结构',
      meanings: ['开阔，通达；免除'],
      phrases: ['豁达', '豁然开朗', '豁免'],
      exampleSentence: '复行数十步，豁然开朗。土地平旷，屋舍俨然。',
      mnemonic: '山谷豁开，天地顿阔。',
      phoneticTrap: {
        type: 'polyphone',
        label: '多音读法（huò vs huō）',
        tip: '“豁达、豁然开朗”读第四声 huò；“豁口、豁出去了”读第一声 huō。'
      },
      gradeId: 'g9'
    }
  ],
  g10: [
    {
      id: 'c-g10-1',
      char: '溯',
      pinyin: 'sù',
      radical: '氵',
      strokeCount: 13,
      strokeOrderHint: '左氵右朔',
      strokeOrderSteps: ['氵', '朔'],
      structure: '左右结构',
      meanings: ['逆流而上；推求追寻'],
      phrases: ['回溯', '溯源', '追根溯源'],
      exampleSentence: '溯流而上，我们寻找文明初生的源头。',
      mnemonic: '水流逆行，回望最初之朔。',
      phoneticTrap: {
        type: 'flat_retroflex',
        label: '平舌音辨析（s vs sh）',
        tip: '“溯”声母是平舌音 sù，切莫受“朔 shuò”影响误读为翘舌音 shù！',
        contrastPair: { correctWord: '溯源', confusingWord: '扑朔迷离', correctPinyin: 'sù', confusingPinyin: 'shuò' }
      },
      gradeId: 'g10'
    },
    {
      id: 'c-g10-2',
      char: '羁',
      pinyin: 'jī',
      radical: '网',
      strokeCount: 17,
      strokeOrderHint: '上罒，中革，下马',
      strokeOrderSteps: ['罒', '革', '马'],
      structure: '上中下结构',
      meanings: ['马络头；束缚；寄居异乡'],
      phrases: ['羁绊', '羁鸟', '放荡不羁', '羁旅'],
      exampleSentence: '羁鸟恋旧林，池鱼思故渊。',
      mnemonic: '以皮革缰绳套住骏马，意为羁绊。',
      gradeId: 'g10'
    }
  ],
  g11: [
    {
      id: 'c-g11-1',
      char: '涸',
      pinyin: 'hé',
      radical: '氵',
      strokeCount: 11,
      strokeOrderHint: '左氵右固',
      strokeOrderSteps: ['氵', '固'],
      structure: '左右结构',
      meanings: ['水干，干枯'],
      phrases: ['涸辙之鲋', '枯涸', '涸泽而渔'],
      exampleSentence: '泉涸，鱼相与处于陆，相濡以沫，不如相忘于江湖。',
      mnemonic: '流水凝固断绝，便化作干涸。',
      phoneticTrap: {
        type: 'tone',
        label: '字音辨析（hé vs gù）',
        tip: '虽然右边是“固”，但该字读音为 hé（第二声），不可读半边为 gù。'
      },
      gradeId: 'g11'
    },
    {
      id: 'c-g11-2',
      char: '睿',
      pinyin: 'ruì',
      radical: '目',
      strokeCount: 14,
      strokeOrderHint: '上虍变体，中目，下一',
      strokeOrderSteps: ['虍', '目', '一'],
      structure: '上下结构',
      meanings: ['深明，通达，有远见智慧'],
      phrases: ['睿智', '睿见', '聪明睿达'],
      exampleSentence: '先生以深邃的眼光和睿智的哲思洞察历史轨迹。',
      mnemonic: '目力深远，穿透迷雾，谓之睿智。',
      phoneticTrap: {
        type: 'flat_retroflex',
        label: '翘舌音（r 辅音）',
        tip: '“睿”读 ruì 为翘舌音，切勿误读成 yì 或 lèi。'
      },
      gradeId: 'g11'
    }
  ],
  g12: [
    {
      id: 'c-g12-1',
      char: '臻',
      pinyin: 'zhēn',
      radical: '至',
      strokeCount: 16,
      strokeOrderHint: '左至右秦',
      strokeOrderSteps: ['至', '秦'],
      structure: '左右结构',
      meanings: ['达到，来到；达到完备完美境界'],
      phrases: ['日臻完善', '百福并臻', '臻于化境'],
      exampleSentence: '精益求精的工匠精神，促使技艺日臻完美。',
      mnemonic: '至达最高，如秦之雄厚汇聚。',
      phoneticTrap: {
        type: 'front_nasal',
        label: '前鼻音易错（-en vs -eng）',
        tip: '“臻”读 zhēn 是翘舌前鼻音，发音时舌尖顶住上牙龈；严禁读成后鼻音 zhēng（争/蒸）。',
        contrastPair: { correctWord: '日臻完善', confusingWord: '蒸蒸日上', correctPinyin: 'zhēn', confusingPinyin: 'zhēng' }
      },
      gradeId: 'g12'
    },
    {
      id: 'c-g12-2',
      char: '韬',
      pinyin: 'tāo',
      radical: '韦',
      strokeCount: 14,
      strokeOrderHint: '左韦右舀',
      strokeOrderSteps: ['韦', '舀'],
      structure: '左右结构',
      meanings: ['装弓剑的皮套；隐藏，含蓄'],
      phrases: ['韬光养晦', '韬略', '文韬武略'],
      exampleSentence: '君子当怀兼济天下之志，亦需明韬光养晦之道。',
      mnemonic: '将锋芒收纳于皮套之中，深藏不露。',
      phoneticTrap: {
        type: 'tone',
        label: '字音声调（tāo 第一声）',
        tip: '“韬”读第一声 tāo，勿误读为第三声 tǎo。'
      },
      gradeId: 'g12'
    }
  ]
};

import { GradeInfo, CharacterItem, WordItem, SentenceItem, EssayItem, ExamQuestion, GradeId, CurriculumConfig } from '../types/chinese';

export const GRADES_LIST: GradeInfo[] = [
  {
    id: 'g1',
    name: '一年级',
    section: 'primary',
    stageName: '小学低段',
    description: '识字启蒙 · 拼音韵律 · 笔顺认知',
    theme: '象形指事，天地自然'
  },
  {
    id: 'g2',
    name: '二年级',
    section: 'primary',
    stageName: '小学低段',
    description: '词语拓展 · 偏旁归类 · 简单句式',
    theme: '四季物候，童趣观察'
  },
  {
    id: 'g3',
    name: '三年级',
    section: 'primary',
    stageName: '小学中段',
    description: '修辞起步 · 段落构筑 · 观察写作',
    theme: '比喻拟人，细致描摹'
  },
  {
    id: 'g4',
    name: '四年级',
    section: 'primary',
    stageName: '小学中段',
    description: '成语典故 · 逻辑句联 · 叙事起承',
    theme: '神话寓言，条理叙述'
  },
  {
    id: 'g5',
    name: '五年级',
    section: 'primary',
    stageName: '小学高段',
    description: '文言初探 · 标点语病 · 托物言志',
    theme: '家国情怀，景物寄情'
  },
  {
    id: 'g6',
    name: '六年级',
    section: 'primary',
    stageName: '小学高段',
    description: '小升初衔接 · 古诗文赏读 · 议论萌芽',
    theme: '经典涵泳，品格砥砺'
  },
  {
    id: 'g7',
    name: '七年级（初一）',
    section: 'middle',
    stageName: '初中阶段',
    description: '叙事散文 · 文言实词 · 借景抒情',
    theme: '人世温情，山川游记'
  },
  {
    id: 'g8',
    name: '八年级（初二）',
    section: 'middle',
    stageName: '初中阶段',
    description: '新闻说明 · 议论文初步 · 诗词意象',
    theme: '求真探微，天下情怀'
  },
  {
    id: 'g9',
    name: '九年级（初三）',
    section: 'middle',
    stageName: '初中阶段',
    description: '中考冲刺 · 深度议论 · 经典文言名篇',
    theme: '修齐治平，思辨求索'
  },
  {
    id: 'g10',
    name: '高一年级',
    section: 'high',
    stageName: '高中阶段',
    description: '经典现代文 · 先秦诸子 · 诗歌韵味',
    theme: '思想激荡，理性审视'
  },
  {
    id: 'g11',
    name: '高二年级',
    section: 'high',
    stageName: '高中阶段',
    description: '唐宋八大家 · 逻辑推理 · 辩证批判',
    theme: '文化深流，哲学反思'
  },
  {
    id: 'g12',
    name: '高三年级',
    section: 'high',
    stageName: '高中阶段',
    description: '高考决胜 · 满分作文思维 · 综合运用',
    theme: '融会贯通，登峰造极'
  }
];

// 生字库 (涵盖各年级核心生字)
export const CHARACTERS_DATA: Record<GradeId, CharacterItem[]> = {
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

// 词语库
export const WORDS_DATA: Record<GradeId, WordItem[]> = {
  g1: [
    {
      id: 'w-g1-1',
      word: '春天',
      pinyin: 'chūn tiān',
      pos: '名词',
      definition: '一年四季的第一季，万物复苏、春暖花开的季节。',
      synonyms: ['春季', '早春', '阳春'],
      antonyms: ['秋天', '冬天'],
      exampleSentence: '春天来了，小燕子从南方飞回来了。',
      culturalNote: '春为岁之首，寓意着生机、希望与万物萌动。',
      gradeId: 'g1'
    },
    {
      id: 'w-g1-2',
      word: '快乐',
      pinyin: 'kuài lè',
      pos: '形容词',
      definition: '感到幸福或满意的心情，心情舒畅开朗。',
      synonyms: ['高兴', '欢快', '愉悦'],
      antonyms: ['悲伤', '痛苦', '忧愁'],
      exampleSentence: '小朋友们在草地上快乐地玩耍。',
      culturalNote: '“乐”在甲骨文中象征琴瑟之音，后演变为心中喜悦。',
      gradeId: 'g1'
    }
  ],
  g2: [
    {
      id: 'w-g2-1',
      word: '芬芳',
      pinyin: 'fēn fāng',
      pos: '形容词',
      definition: '香气浓郁，也指香气扑鼻的花草。',
      synonyms: ['芳香', '馥郁', '芳菲'],
      antonyms: ['恶臭', '腥臭'],
      exampleSentence: '花园里盛开着各种鲜花，散发出阵阵芬芳。',
      culturalNote: '屈原在《楚辞》中常以芬芳花草比喻高尚圣洁的品德。',
      gradeId: 'g2'
    },
    {
      id: 'w-g2-2',
      word: '生机勃勃',
      pinyin: 'shēng jī bó bó',
      pos: '成语',
      definition: '形容自然界充满生命活力，生命力旺盛。',
      synonyms: ['朝气蓬勃', '生生不息', '盎然成趣'],
      antonyms: ['死气沉沉', '老态龙钟'],
      exampleSentence: '春回大地，万物复苏，整座田野展现出生机勃勃的景象。',
      culturalNote: '“勃勃”形容旺盛涌现的样子。',
      gradeId: 'g2'
    }
  ],
  g3: [
    {
      id: 'w-g3-1',
      word: '波光粼粼',
      pinyin: 'bō guāng lín lín',
      pos: '成语',
      definition: '形容水石清澈，在阳光或月光照射下闪烁着细碎光亮的样子。',
      synonyms: ['碧波荡漾', '微波粼粼', '浮光跃金'],
      antonyms: ['一潭死水', '水平如镜'],
      exampleSentence: '夕阳西下，宽阔的湖面上波光粼粼，美丽极了。',
      culturalNote: '古典诗词常用波光比喻时间的灵动与自然的纯净美。',
      gradeId: 'g3'
    },
    {
      id: 'w-g3-2',
      word: '栩栩如生',
      pinyin: 'xǔ xǔ rú shēng',
      pos: '成语',
      definition: '形容画作、雕塑等艺术品极为逼真，像活的一样。',
      synonyms: ['活灵活现', '惟妙惟肖', '逼真动人'],
      antonyms: ['呆板无神', '死板生硬'],
      exampleSentence: '老艺人捏出的面人儿栩栩如生，引来许多人驻足观赏。',
      culturalNote: '出自《庄子·齐物论》“昔者庄周梦为胡蝶，栩栩然胡蝶也”。',
      gradeId: 'g3'
    }
  ],
  g4: [
    {
      id: 'w-g4-1',
      word: '齐头并进',
      pinyin: 'qí tóu bìng jìn',
      pos: '成语',
      definition: '多方面同时前进或发展，互相协调推进。',
      synonyms: ['并驾齐驱', '双管齐下', '齐步迈进'],
      antonyms: ['各自为政', '一先一后'],
      exampleSentence: '钱塘江大潮那奔腾的白色浪头，犹如千万匹白色战马齐头并进。',
      culturalNote: '常用于写景的磅礴气势或事业多维发展的壮阔局面。',
      gradeId: 'g4'
    },
    {
      id: 'w-g4-2',
      word: '若隐若现',
      pinyin: 'ruò yǐn ruò xiàn',
      pos: '成语',
      definition: '好像消失，又好像出现；形容朦朦胧胧、不清晰。',
      synonyms: ['若即若离', '隐约可见', '浮光掠影'],
      antonyms: ['一清二楚', '黑白分明'],
      exampleSentence: '远处的山峰在薄雾中若隐若现，如同一幅写意的山水长卷。',
      culturalNote: '中国古典美学讲究“虚实相生”，若隐若现最能营造含蓄意境。',
      gradeId: 'g4'
    }
  ],
  g5: [
    {
      id: 'w-g5-1',
      word: '美中不足',
      pinyin: 'měi zhōng bù zú',
      pos: '成语',
      definition: '事情虽然已经很好，但还有不够完美的小缺点。',
      synonyms: ['白璧微瑕', '差强人意'],
      antonyms: ['十全十美', '无可挑剔'],
      exampleSentence: '今天登高赏景非常尽兴，美中不足的是没能看到日出。',
      culturalNote: '出自明代凌濛初《初刻拍案惊奇》。古人认为万物留白方有余味。',
      gradeId: 'g5'
    },
    {
      id: 'w-g5-2',
      word: '不计其数',
      pinyin: 'bù jì qí shù',
      pos: '成语',
      definition: '数目极多，无法计算。',
      synonyms: ['数不胜数', '不胜枚举', '多如牛毛'],
      antonyms: ['寥寥无几', '屈指可数'],
      exampleSentence: '夜空中的星星不计其数，眨着明亮的眼睛。',
      culturalNote: '常用于宏大场面或数量繁盛的描绘。',
      gradeId: 'g5'
    }
  ],
  g6: [
    {
      id: 'w-g6-1',
      word: '高山流水',
      pinyin: 'gāo shān liú shuǐ',
      pos: '成语',
      definition: '比喻乐曲高妙，也比喻知己或知音难得。',
      synonyms: ['阳春白雪', '莫逆之交', '千古知音'],
      antonyms: ['下里巴人', '反目成仇'],
      exampleSentence: '伯牙善鼓琴，钟子期善听，遂有高山流水觅知音的千古美谈。',
      culturalNote: '源自《列子·汤问》，讲述伯牙与钟子期的千古知己深情。',
      gradeId: 'g6'
    },
    {
      id: 'w-g6-2',
      word: '巧夺天工',
      pinyin: 'qiǎo duó tiān gōng',
      pos: '成语',
      definition: '精巧的人工制作胜过天然形成，形容技艺极其精巧高超。',
      synonyms: ['鬼斧神工', '出神入化', '登峰造极'],
      antonyms: ['粗制滥造', '笨拙不堪'],
      exampleSentence: '这件象牙微雕作品巧夺天工，每一个人物的表情都清晰可见。',
      culturalNote: '“夺”意为胜过，强调人类创造力的极致境界。',
      gradeId: 'g6'
    }
  ],
  g7: [
    {
      id: 'w-g7-1',
      word: '呼朋引伴',
      pinyin: 'hū péng yǐn bàn',
      pos: '成语',
      definition: '招呼朋友，吸引同伴。多形容群鸟相鸣或人群欢聚的情景。',
      synonyms: ['招兵买马', '三五成群', '引伴招友'],
      antonyms: ['孤苦伶仃', '形单影只'],
      exampleSentence: '春天里，鸟儿在繁花嫩叶中呼朋引伴，卖弄清脆的歌喉。',
      culturalNote: '朱自清散文《春》中的名句，具有极强的音乐美与动态感。',
      gradeId: 'g7'
    },
    {
      id: 'w-g7-2',
      word: '花枝招展',
      pinyin: 'huā zhī zhāo zhǎn',
      pos: '成语',
      definition: '形容花朵姿态婀娜；比喻女子打扮得十分娇艳美丽，或春天生机蓬勃。',
      synonyms: ['婀娜多姿', '千娇百媚', '姹紫嫣红'],
      antonyms: ['素面朝天', '枯木死灰'],
      exampleSentence: '春天像小姑娘，花枝招展的，笑着，走着。',
      culturalNote: '常用于比喻修辞中赋予抽象时节以灵动的人格化形象。',
      gradeId: 'g7'
    }
  ],
  g8: [
    {
      id: 'w-g8-1',
      word: '触目伤怀',
      pinyin: 'chù mù shāng huái',
      pos: '成语',
      definition: '看到某种触动人心的景象，心里感到悲伤难过。',
      synonyms: ['触景生情', '抚今追昔', '悲从中来'],
      antonyms: ['赏心悦目', '怡然自得'],
      exampleSentence: '朱自清在《背影》中写道：“到徐州见着父亲，看见满院狼藉的东西，又想起祖母，不禁簌簌地流下眼泪。这些触目伤怀的事，让我久久难忘。”',
      culturalNote: '体现中国传统文学中“情由景生，景随情移”的审美体验。',
      gradeId: 'g8'
    },
    {
      id: 'w-g8-2',
      word: '情郁于中',
      pinyin: 'qíng yù yú zhōng',
      pos: '成语',
      definition: '深厚的情感积聚在内心深处，难以抒发。',
      synonyms: ['郁结于心', '积郁成疾', '感怀深切'],
      antonyms: ['心宽体胖', '豁达从容'],
      exampleSentence: '情郁于中，自然要发之于外；家庭琐屑便往往触他之怒。',
      culturalNote: '“郁”指积聚浓缩，是含蓄内敛文风的重要表征。',
      gradeId: 'g8'
    }
  ],
  g9: [
    {
      id: 'w-g9-1',
      word: '断章取义',
      pinyin: 'duàn zhāng qǔ yì',
      pos: '成语',
      definition: '不顾全篇文章或谈话的完整意义，孤立地截取其中一段或一句来解释。',
      synonyms: ['穿凿附会', '牵强附会', '生搬硬套'],
      antonyms: ['实事求是', '通篇贯通'],
      exampleSentence: '我们在引用名人格言时，必须结合具体语境，绝不能断章取义。',
      culturalNote: '语出《左传·襄公二十八年》“赋《诗》断章，余取所求焉”。',
      gradeId: 'g9'
    },
    {
      id: 'w-g9-2',
      word: '心无旁骛',
      pinyin: 'xīn wú páng wù',
      pos: '成语',
      definition: '心思集中，没有杂念，专心致志地做一件事。',
      synonyms: ['全神贯注', '专心致志', '聚精会神'],
      antonyms: ['三心二意', '魂不守舍'],
      exampleSentence: '做学问唯有做到心无旁骛、耐得住寂寞，才能有所突破。',
      culturalNote: '梁启超在《敬业与乐业》中推崇的专注尽责的精神境界。',
      gradeId: 'g9'
    }
  ],
  g10: [
    {
      id: 'w-g10-1',
      word: '沧海一粟',
      pinyin: 'cāng hǎi yī sù',
      pos: '成语',
      definition: '大海里的一颗谷粒。比喻渺小至极。',
      synonyms: ['九牛一毛', '微不足道', '微乎其微'],
      antonyms: ['举足轻重', '硕大无朋'],
      exampleSentence: '寄蜉蝣于天地，渺沧海之一粟。哀吾生之须臾，羡长江之无穷。',
      culturalNote: '苏轼《赤壁赋》名句，表达对宇宙永恒与个体短暂的哲学沉思。',
      gradeId: 'g10'
    },
    {
      id: 'w-g10-2',
      word: '风华正茂',
      pinyin: 'fēng huá zhèng mào',
      pos: '成语',
      definition: '风采和才华正盛，多形容青年人朝气蓬勃、奋发有为。',
      synonyms: ['意气风发', '青春洋溢', '朝气蓬勃'],
      antonyms: ['暮气沉沉', '风烛残年'],
      exampleSentence: '恰同学少年，风华正茂；书生意气，挥斥方遒。',
      culturalNote: '毛泽东《沁园春·长沙》著名诗句，寄托对时代青年的赞歌。',
      gradeId: 'g10'
    }
  ],
  g11: [
    {
      id: 'w-g11-1',
      word: '浅尝辄止',
      pinyin: 'qiǎn cháng zhé zhǐ',
      pos: '成语',
      definition: '略微尝试一下就停下来，形容不深入钻研。',
      synonyms: ['走马观花', '蜻蜓点水', '浮光掠影'],
      antonyms: ['持之以恒', '孜孜不倦', '深谋远虑'],
      exampleSentence: '做学问最忌浅尝辄止，唯有探赜索隐，方能见其奥义。',
      culturalNote: '常用于议论文批判浮躁学风或表面化的思考倾向。',
      gradeId: 'g11'
    },
    {
      id: 'w-g11-2',
      word: '见微知著',
      pinyin: 'jiàn wēi zhī zhù',
      pos: '成语',
      definition: '见到事物的一点苗头，就能预知其发展趋势或本质。',
      synonyms: ['一叶知秋', '落叶知秋', '防微杜渐'],
      antonyms: ['后知后觉', '视而不见'],
      exampleSentence: '真正深刻的思想家往往能见微知著，从日常生活小事中揭示时代脉动。',
      culturalNote: '出处《韩非子·说林上》，辩证思维与敏锐洞察力的高峰。',
      gradeId: 'g11'
    }
  ],
  g12: [
    {
      id: 'w-g12-1',
      word: '博约相融',
      pinyin: 'bó yuē xiāng róng',
      pos: '成语',
      definition: '广博的积淀与精约的提炼相互结合、浑然一体。',
      synonyms: ['博观约取', '厚积薄发'],
      antonyms: ['坐井观天', '杂而不纯'],
      exampleSentence: '高考优秀议论文讲求博约相融，既有丰厚翔实的论据，又有提纲挈领的深刻洞见。',
      culturalNote: '苏轼《稼说送张琥》“博观而约取，厚积而薄发”的现代演化。',
      gradeId: 'g12'
    },
    {
      id: 'w-g12-2',
      word: '返璞归真',
      pinyin: 'fǎn pú guī zhēn',
      pos: '成语',
      definition: '去掉外在的雕饰与浮华，回复到原始纯真质朴的境界。',
      synonyms: ['大巧若拙', '抱朴守拙', '洗尽铅华'],
      antonyms: ['虚华浮夸', '附庸风雅'],
      exampleSentence: '文章写到极致，往往不是词藻的堆砌，而是返璞归真的通透与诚恳。',
      culturalNote: '道家“见素抱朴，少私寡欲”的重要美学命题。',
      gradeId: 'g12'
    }
  ]
};

// 句子库 (修辞、病句、文言文翻译、经典仿写)
export const SENTENCES_DATA: Record<GradeId, SentenceItem[]> = {
  g1: [
    {
      id: 's-g1-1',
      category: 'rhetoric',
      categoryLabel: '修辞手法 · 比喻',
      title: '比喻句的初识与运用',
      originalText: '弯弯的月儿小小的船，小小的船儿两头尖。',
      analysis: '把“月儿”比作“小船”，本体是“弯弯的月儿”，喻体是“两头尖的小船”，生动形象地写出了月牙的形状与轻盈可爱。',
      keyDevices: ['比喻', '叠词运用'],
      practicePrompt: '请用“像”字造一个比喻句，描写太阳或云朵。',
      practiceAnswer: '红红的太阳像一个大火球，高高地挂在天空中。',
      gradeId: 'g1'
    }
  ],
  g2: [
    {
      id: 's-g2-1',
      category: 'rhetoric',
      categoryLabel: '修辞手法 · 拟人',
      title: '拟人句：让万物富有情感',
      originalText: '小草从地下探出头来，那是春天的眉毛吧？',
      analysis: '用一个动词“探出头来”，赋予小草以人的动作和好奇神态，生机盎然，趣味十足。',
      keyDevices: ['拟人', '设问比喻'],
      practicePrompt: '仿照例句，用拟人的手法写一写春天的花儿或小溪。',
      practiceAnswer: '粉红的桃花在枝头展开笑脸，向路过的人们招手致意。',
      gradeId: 'g2'
    }
  ],
  g3: [
    {
      id: 's-g3-1',
      category: 'rhetoric',
      categoryLabel: '修辞手法 · 排比',
      title: '排比句的气势与节奏',
      originalText: '海里的动物，各有各的活动方法。海参靠肌肉伸缩爬行；身体像梭子的鱼，每小时能游几十千米；乌贼和章鱼能突然向前方喷水，利用水的反推力迅速后退。',
      analysis: '采用排比句式罗列三种不同海洋生物独特的运动方式，节奏明快，条理清晰，增强了说明的生动性与丰富度。',
      keyDevices: ['排比', '分类描写'],
      practicePrompt: '请用“有的……有的……还有的……”写一个描写操场上同学们课间活动的排比句。',
      practiceAnswer: '下课了，操场上真热闹，同学们有的在踢足球，有的在跳绳，还有的在树荫下开心地看书。',
      gradeId: 'g3'
    }
  ],
  g4: [
    {
      id: 's-g4-1',
      category: 'imitation',
      categoryLabel: '语言运用 · 动态描写',
      title: '钱塘江大潮声势刻画',
      originalText: '浪潮越来越近，犹如千万匹白色战马齐头并进，浩浩荡荡地飞奔而来；那声音如同千万辆坦克同时开动，发出山崩地裂的响声。',
      analysis: '作者从视听双重感官着手，“白色战马”写浪潮之形，“山崩地裂”写浪潮之声，运用夸张与比喻，展现大自然的惊人伟力。',
      keyDevices: ['比喻', '夸张', '视听结合'],
      practicePrompt: '请借鉴视听结合的写法，写一段暴风雨来临时的生动情景。',
      practiceAnswer: '乌云如同一块巨大的黑幕沉沉压下，刹那间电光闪烁，滚滚春雷犹如万鼓齐鸣，暴雨伴随着狂风呼啸而至。',
      gradeId: 'g4'
    }
  ],
  g5: [
    {
      id: 's-g5-1',
      category: 'error_correction',
      categoryLabel: '语病修改 · 常见语病辨析',
      title: '搭配不当与成分残缺',
      originalText: '通过这次生动的语文实践活动，使同学们深刻认识到了阅读经典名著的重要性。',
      analysis: '典型“滥用介词导致主语残缺”病句。“通过……”与“使……”同时使用，导致句子缺少真正的主语。修改方法为删去“通过”或删去“使”。',
      keyDevices: ['主谓宾一致', '成分残缺修改'],
      practicePrompt: '请修改该病句并给出正确句子。',
      practiceAnswer: '修改一：这次生动的语文实践活动，使同学们深刻认识到了阅读经典名著的重要性。\n修改二：通过这次生动的语文实践活动，同学们深刻认识到了阅读经典名著的重要性。',
      gradeId: 'g5'
    }
  ],
  g6: [
    {
      id: 's-g6-1',
      category: 'classical',
      categoryLabel: '文言名句 · 赏析与翻译',
      title: '《伯牙鼓琴》知音千古',
      originalText: '伯牙鼓琴，志在登高山，钟子期曰：“善哉！峨峨兮若泰山。”志在流水，钟子期曰：“善哉！洋洋兮若江河。”',
      modernTranslation: '伯牙弹琴时，心里想着高山，钟子期听了说：“好啊！巍峨耸立就如同巍巍泰山一样。”伯牙心里想着流水，钟子期听了说：“好啊！浩浩荡荡就如同滚滚江河一样。”',
      analysis: '“峨峨”形容山高，“洋洋”形容水势广阔。“若”即“像”。此句体现了心有灵犀、高妙艺术心灵共振的至高审美境界。',
      keyDevices: ['对仗', '感叹句', '比喻性意象'],
      practicePrompt: '解释加点字词：“鼓”与“善哉”的意思。',
      practiceAnswer: '“鼓”在句中作动词，意思是“弹奏”；“善哉”表示赞叹，意思是“好啊！太棒了！”',
      gradeId: 'g6'
    }
  ],
  g7: [
    {
      id: 's-g7-1',
      category: 'classical',
      categoryLabel: '古诗文名句 · 借景抒情',
      title: '《次北固山下》时序更迭与哲思',
      originalText: '海日生残夜，江春入旧年。',
      modernTranslation: '红日从残夜中破晓而生，春意已经潜入旧年之尾。',
      analysis: '妙用“生”与“入”两字，将大自然的昼夜交替与冬春更迭拟人化，富有生机。蕴含着新事物必将孕育于旧事物之中的哲理，成为千古流传的名句。',
      keyDevices: ['对仗工整', '拟人动词', '寓哲理于写景'],
      practicePrompt: '请指出“海日生残夜，江春入旧年”中蕴含着怎样深刻的人生哲理？',
      practiceAnswer: '该句通过新旧时序的交替，揭示出新旧事物更迭的自然法则，表现了新生力量不可遏制的蓬勃生机，给人以乐观向上、充满希望的哲理启示。',
      gradeId: 'g7'
    }
  ],
  g8: [
    {
      id: 's-g8-1',
      category: 'imitation',
      categoryLabel: '经典散文 · 细节白描',
      title: '朱自清《背影》车站买橘白描',
      originalText: '我看见他戴着黑布小帽，穿着黑布大马褂，深青布棉袍，蹒跚地走到铁道边，慢慢探身下去，尚不大难。可是他穿过铁道，要爬上那边月台，就不容易了。他用两手攀着上面，两脚再向上缩；他肥胖的身子向左微倾，显出努力的样子。',
      analysis: '通篇采用精准的动词链（走、探、穿、爬、攀、缩、倾），没有华丽辞藻，纯用朴素的白描手法，将父亲对儿子无微不至却沉重深沉的爱刻画得淋漓尽致。',
      keyDevices: ['白描手法', '动词链刻画', '深层情感寄托'],
      practicePrompt: '请运用连续动词的白描手法，描写母亲做饭或老师批改作业的一个细微动作瞬间。',
      practiceAnswer: '老师轻轻翻开作业本，拿起红笔，微微倾身，目光在字里行间细细移动，时而轻轻圈点，时而提笔沉思，工工整整写下一行温暖的评语。',
      gradeId: 'g8'
    }
  ],
  g9: [
    {
      id: 's-g9-1',
      category: 'classical',
      categoryLabel: '文言名篇 · 议论警句',
      title: '《岳阳楼记》家国情怀至理名言',
      originalText: '居庙堂之高则忧其民，处江湖之远则忧其君。是进亦忧，退亦忧。然则何时而乐耶？其必曰“先天下之忧而忧，后天下之乐而乐”乎！',
      modernTranslation: '在朝廷做官就为百姓担忧；退居隐逸在江湖民间就为君王国家担忧。这样在朝廷是忧，退居乡野也是忧。既然如此，那么什么时候才快乐呢？那一定要说“在天下人担忧之前先担忧，在天下人享乐之后才享乐”吧！',
      analysis: '范仲淹将个人忧乐完全融于天下苍生的安危祸福之中，超越了普通文人的“以物喜，以己悲”，成为中华民族士大夫的精神丰碑。',
      keyDevices: ['对比', '设问与反问', '互文见义', '千古格言'],
      practicePrompt: '请写出“居庙堂之高”与“处江湖之远”所使用的修辞手法及指代含义。',
      practiceAnswer: '运用了借代与对仗修辞。“庙堂之高”借指在朝为官、身居显赫要职；“江湖之远”借指退隐江湖、离开朝廷远居民间。',
      gradeId: 'g9'
    }
  ],
  g10: [
    {
      id: 's-g10-1',
      category: 'classical',
      categoryLabel: '哲学散文 · 辩证思辨',
      title: '苏轼《赤壁赋》水月与变与不变',
      originalText: '逝者如斯，而未尝往也；盈虚者如彼，而卒莫消长也。盖将自其变者而观之，则天地曾不能以一瞬；自其不变者而观之，则物与我皆无尽也，而又何羡乎！',
      modernTranslation: '流逝的水正如这江流一样，但其实并没有真正流去；月亮有圆有缺，但它终究没有增减。如果从那变化的方面去看它，那么天地间万物连一眨眼的工夫都不能保持原样；如果从那不变的方面去看它，那么事物和我们都是无穷无尽的，又何必羡慕江水和明月呢！',
      analysis: '苏轼以江水与明月为喻，借辩证的哲理化解人生须臾短促的苦闷与悲伤，展示了超脱旷达的人生胸襟。',
      keyDevices: ['对比说理', '借景喻理', '一唱三叹'],
      practicePrompt: '分析文中“变”与“不变”的辩证关系对现代人面对生活得失有何启示？',
      practiceAnswer: '启示我们在面对人生的得失起伏时，既要看到时光流逝不可阻挡的客观性，更要把握心灵充盈与精神追求的永恒性，从而坦然面对逆境，保持旷达胸襟。',
      gradeId: 'g10'
    }
  ],
  g11: [
    {
      id: 's-g11-1',
      category: 'rhetoric',
      categoryLabel: '议论锋芒 · 归谬与反诘',
      title: '鲁迅《拿来主义》批判与立论',
      originalText: '尼采就自诩过他是太阳，光热无穷，只是给与，不想取得。然而尼采究竟不是太阳，他发了疯。中国也不是太阳，但有人却想充当太阳，把所有东西都送去，这不仅是愚蠢，简直是自掘坟墓。我们要运用脑髓，放出眼光，自己来拿！',
      analysis: '鲁迅以杂文之笔，用“尼采与太阳”作喻，通过归谬法彻底揭穿“闭关主义”与“送去主义”的虚妄与危害，旗帜鲜明地树立起“独立自主、理性取舍”的“拿来主义”论点。',
      keyDevices: ['类比与归谬', '警策比喻', '强烈反讽'],
      practicePrompt: '简析“运用脑髓，放出眼光，自己来拿”中三个短语的逻辑内涵。',
      practiceAnswer: '“运用脑髓”指独立深入思考；“放出眼光”指具有敏锐的鉴别力与开阔视野；“自己来拿”指不盲从、不怯懦，主动吸收吸收外来有益文明成果。',
      gradeId: 'g11'
    }
  ],
  g12: [
    {
      id: 's-g12-1',
      category: 'imitation',
      categoryLabel: '高考思辨 · 论述金句构筑',
      title: '高考满分思辨句式范式',
      originalText: '青年当有“致广大而尽精微”之追求，既要在浩瀚的理想星空下锚定航向，又要在细琐的躬行实践中沉潜扎根。大巧不工，厚积薄发，方能在纷纭变幻的时代风云中，笃定前行，行稳致远。',
      analysis: '句式长短结合，融汇经典典故（《中庸》“致广大而尽精微”）与四字成语，兼具理性逻辑与抒情张力，是高考考场议论文首尾呼应、升华立意的标杆示范。',
      keyDevices: ['化用典故', '对偶排比', '辩证升华'],
      practicePrompt: '请以“科技创新”与“人文温度”为核心概念，仿写一段兼具思辨与文采的议论段。',
      practiceAnswer: '科技拓展了人类认知与探索的广度，而人文则赋予了文明立足与前行的温度。若无科技之翼，文明难以冲破迷雾；若失人文之舵，航船终将迷失归途。唯有科技与人文相融相济，时代的发展才能真正向善向美。',
      gradeId: 'g12'
    }
  ]
};

// 作文天地 (含题目要求、写作构思技巧、名师高分范文、段落赏析与金句素材)
export const ESSAYS_DATA: Record<GradeId, EssayItem[]> = {
  g1: [
    {
      id: 'e-g1-1',
      title: '看图说话写话：《可爱的小猫》',
      gradeTier: '一年级 · 写话启蒙',
      promptText: '仔细观察身边的小动物，说说它长什么样子，它有什么好玩的习性，你为什么喜欢它？写几句通顺完整的话。',
      outlineAdvice: [
        '第一步：介绍动物名字与外貌（全身毛色、耳朵、眼睛、尾巴）',
        '第二步：描写一个生活中有趣的小动作（玩毛线球、晒太阳捉老鼠）',
        '第三步：抒发自己对它的喜爱之情'
      ],
      keyTechniques: [
        '使用“白白的”、“圆溜溜”等生动的叠词',
        '运用简单的比喻，如“眼睛像两颗绿宝石”',
        '标点符号要规范（句号、逗号、感叹号）'
      ],
      modelEssay: {
        title: '我家的小花猫',
        paragraphs: [
          '我家有一只可爱的小花猫，它的名字叫“雪球”。',
          '雪球全身长着雪白雪白的毛，摸上去软绵绵的。它的耳朵尖尖的，哪怕有一点点声音，都会轻轻转动。最特别的是它的眼睛，白天像一条细缝，到了晚上就变得又大又圆，像两颗闪闪发光的绿宝石。',
          '雪球最喜欢玩毛线球了。每次妈妈织毛衣，它就悄悄跑过来，用小爪子拨一下，毛线球滚跑了，它就飞快地扑上去，逗得全家人哈哈大笑。',
          '雪球真是一只聪明又淘气的小猫，我太喜欢它了！'
        ]
      },
      paragraphAnnotations: [
        '第1段：开门见山，直接点出描写对象和名字。',
        '第2段：按从头到身子的顺序，细致描写耳朵和奇妙的眼睛，巧用比喻。',
        '第3段：捕捉一个生动的生活小细节，动词“跑、拨、扑”一气呵成。',
        '第4段：总结全文，真诚抒发喜爱之情，结构完整。'
      ],
      goodPhrases: ['雪白雪白', '软绵绵', '绿宝石', '悄悄', '扑上去', '哈哈大笑'],
      sampleMaterials: [
        { title: '童谣启蒙', quote: '小猫咪，喵喵叫，白白胡子尖尖爪。' },
        { title: '自然观察', quote: '猫的眼睛会随光线的强弱调节瞳孔大小。' }
      ],
      gradeId: 'g1'
    }
  ],
  g2: [
    {
      id: 'e-g2-1',
      title: '写话天地：《美丽的春天》',
      gradeTier: '二年级 · 观察与想象',
      promptText: '春天来到了大自然，树木、小河、田野和天空发生了哪些变化？把你看到和想到的写下来。',
      outlineAdvice: [
        '开头：一句话引出春天来了，万物复苏',
        '中间：抓住两三个典型景物（柳树、桃花、小燕子、风筝）',
        '结尾：表达对大自然春天的赞叹'
      ],
      keyTechniques: [
        '多角度感官结合（眼睛看的颜色，耳朵听到的鸟鸣）',
        '恰当使用拟人和拟声词（哗啦啦、叽叽喳喳）'
      ],
      modelEssay: {
        title: '春天来到了我们的身边',
        paragraphs: [
          '轻柔的春风吹醒了大地的每一个角落，春天悄悄地来到我们身边。',
          '看，公园里的柳树抽出了嫩绿的枝条，细细的柳叶像一根根翠绿的眉毛，在风中轻轻飘荡。粉红的桃花盛开了，像小姑娘害羞的脸庞。小溪里的冰融化了，正欢快地唱着“哗啦啦”的歌儿奔向远方。',
          '天空中，刚从南方飞回来的小燕子在阳光下自由穿梭。小朋友们脱下了厚厚的棉袄，在宽阔的草地上快乐地奔跑，五颜六色的风筝越飞越高。',
          '春天真是一幅五彩缤纷的图画啊！我爱这生机勃勃的春天。'
        ]
      },
      paragraphAnnotations: [
        '第1段：春风入题，自然流畅。',
        '第2段：由柳树到桃花再到融化的小溪，色彩明快，生动展现春意。',
        '第3段：动静结合，从空中的燕子转到放风筝的孩童，充满生活欢愉。',
        '第4段：将春天比作画卷，点题深化。'
      ],
      goodPhrases: ['轻柔', '嫩绿', '害羞', '生机勃勃', '五彩缤纷', '欢快奔向远方'],
      sampleMaterials: [
        { title: '古诗名句', quote: '碧玉妆成一树高，万条垂下绿丝绦。' },
        { title: '成语点缀', quote: '春光明媚，鸟语花香，万物复苏。' }
      ],
      gradeId: 'g2'
    }
  ],
  g3: [
    {
      id: 'e-g3-1',
      title: '记事作文：《那次玩得真高兴》',
      gradeTier: '三年级 · 记叙起步',
      promptText: '回想一下，哪一次活动或游戏让你玩得最开心、最难忘？把过程和心情写下来。',
      outlineAdvice: [
        '交代时间、地点、人物和玩什么游戏（如老鹰抓小鸡、捉迷藏、做实验）',
        '详细写游戏的高潮和角逐过程（人物的动作、语言与神态）',
        '总结这次游戏带给你的快乐与启发'
      ],
      keyTechniques: [
        '详略得当，突出精彩激烈的关键动作瞬间',
        '穿插描写周围人的笑声与心理活动'
      ],
      modelEssay: {
        title: '操场上的“老鹰抓小鸡”',
        paragraphs: [
          '每当我看到操场上奔跑打闹的同学，就会想起上周五那场激烈又好玩的“老鹰抓小鸡”游戏。',
          '那天体育课，小明自告奋勇当凶猛的“老鹰”，个子最高的小刚当机智勇敢的“鸡妈妈”，我和其他几个同学紧紧拉住前一人的衣角，组成了一条长长的“小鸡”队伍。',
          '游戏一开始，“老鹰”就张开双臂，眼睛瞪得大大的，猛地往左边一扑！“鸡妈妈”反应极快，立刻张开大翅膀向左一挡，大喊：“孩子们抓紧了！”我们身后的“小鸡”们吓得尖叫连连，队伍随着鸡妈妈左摇右摆，像一条扭动的长龙。突然，“老鹰”虚晃一枪，掉头向右侧猛冲过来，排在最后的淘淘跑得慢，一下子成了“老鹰”的盘中餐。',
          '操场上回荡着我们止不住的欢声笑语。虽然大家都跑得满头大汗，但那份同心协力的快乐，久久留在我的心间。'
        ]
      },
      paragraphAnnotations: [
        '第1段：由眼前的景象引出回忆，引人入胜。',
        '第2段：干脆利落地交待角色分工，蓄势待发。',
        '第3段：核心高潮！扑、挡、喊、扭动、虚晃一枪、猛冲，动作描写极其传神。',
        '第4段：升华主题，从单纯的好玩上升到“同心协力”的纯真情谊。'
      ],
      goodPhrases: ['自告奋勇', '虚晃一枪', '尖叫连连', '左摇右摆', '满头大汗', '同心协力'],
      sampleMaterials: [
        { title: '童年金句', quote: '童年是一首欢快的歌，音符里跳跃着奔跑的身影。' }
      ],
      gradeId: 'g3'
    }
  ],
  g4: [
    {
      id: 'e-g4-1',
      title: '写景作文：《迷人的自然奇观》',
      gradeTier: '四年级 · 移步换景与气势',
      promptText: '选择一处令你震撼或陶醉的自然景观（如日出、云海、瀑布、林海），按一定顺序描摹它的特点。',
      outlineAdvice: [
        '引入自然景观，点明其独特地位',
        '按时间或空间顺序，描写其初现、盛景与回落',
        '借景抒情，赞叹自然的鬼斧神工'
      ],
      keyTechniques: [
        '善用移步换景与时间推移词（破晓时分、不一会儿、刹那间）',
        '色彩对比与动态静态的交织'
      ],
      modelEssay: {
        title: '泰山观日出',
        paragraphs: [
          '古人云：“登泰山而小天下。”而泰山之巅最令人心潮澎湃的，莫过于破晓时刻那一轮蓬勃而出的红日。',
          '拂晓时分，天际还是鱼肚白色，周围的一切都笼罩在冷冽而静谧的晨雾中。不知过了多久，东方的天幕上渐渐泛起了一抹极淡的玫瑰红，继而越来越浓，如同一笔朱砂在大宣纸上缓缓晕染开来。漫漫云海翻腾着，宛若波涛滚滚的金红色海洋。',
          '刹那间，那万道金光如利剑般刺破长空，一个滚圆耀眼的火球跃然而出！初升的朝阳将整座峰峦镀上了一层璀璨的金色，万木生辉，云海沸腾，令人叹为观止。',
          '伫立在玉皇顶上，沐浴着初生的万道霞光，我深深折服于大自然的雄伟壮阔，更懂得了唯有不畏艰险登临绝顶，方能一览天地的磅礴。'
        ]
      },
      paragraphAnnotations: [
        '第1段：引述名言，奠定雄浑大气的基调。',
        '第2段：由冷色调到暖色调的渐变（鱼肚白→玫瑰红→金红），极富水墨国画渲染质感。',
        '第3段：日出瞬间的动态高潮，比喻生动贴切，“跃然而出”力量感十足。',
        '第4段：情景交融，由观景升华为攀登人生巅峰的哲思。'
      ],
      goodPhrases: ['破晓时分', '鱼肚白', '朱砂晕染', '万道金光', '叹为观止', '一览天地的磅礴'],
      sampleMaterials: [
        { title: '名家典籍', quote: '《登泰山记》：极天云一线异色，须臾成五采。日光腾熠，宛若金涌。' }
      ],
      gradeId: 'g4'
    }
  ],
  g5: [
    {
      id: 'e-g5-1',
      title: '托物言志：《那株石缝中的野草》',
      gradeTier: '五年级 · 托物言志与哲理',
      promptText: '生活中的一花一草、一木一石，常常蕴含着打动人心的品质。选择一种平凡的事物，托物言志。',
      outlineAdvice: [
        '引子：一次偶然的相遇，发现石缝中或风雨里的微小生命',
        '细写物象：生存环境的恶劣与生命本身的坚韧挺拔',
        '志向升华：由物及人，联想到生活中自强不息的品质'
      ],
      keyTechniques: [
        '对比反差手法（坚硬冰冷的顽石 vs 柔弱却顽强的嫩芽）',
        '借物抒情，虚实相生'
      ],
      modelEssay: {
        title: '峭壁上的青松',
        paragraphs: [
          '它没有苗圃中繁花的娇艳，亦无庭院中修竹的幽雅，却在悬崖绝壁之间，书写着生命最庄严的诗行。',
          '那是一次登山时的偶见。在海拔千米的悬崖峭壁之上，岩石嶙峋，寸草难生。然而，就在那一道仅容指甲嵌入的石缝中，竟然挺立着一株苍劲的青松。它的根须如虬龙般深深扎入冰冷的岩脉，树干虽然弯曲，却倔强地向着云天伸展。任凭狂风嘶吼、暴雨冲刷，它始终默然屹立，针叶如墨，苍翠欲滴。',
          '在没有肥沃土壤的眷顾下，它靠着岩壁渗出的涓滴雨露和清冷的山风，活出了属于自己的伟岸与傲骨。每一次风雨的撕扯，都化作了它坚韧年轮的铸造者。',
          '人的一生何尝不是如此？环境或许无法抉择，但生命的高度与厚度，却永远取决于那份在困厄中向下扎根、向上挺拔的坚定意志。'
        ]
      },
      paragraphAnnotations: [
        '第1段：先抑后扬，通过与娇艳花草对比，确立青松的不俗风骨。',
        '第2段：工笔细描，将青松扎根石缝的顽强形态描摹得如雕塑般坚毅。',
        '第3段：深层剖析青松的精神内核——化苦难为养分。',
        '第4段：水到渠成升华到人生修养，言近而旨远。'
      ],
      goodPhrases: ['绝壁之间', '嶙峋', '如虬龙般', '倔强伸展', '苍翠欲滴', '向下扎根'],
      sampleMaterials: [
        { title: '郑板桥名作', quote: '咬定青山不放松，立根原在破岩中。千磨万击还坚劲，任尔东西南北风。' }
      ],
      gradeId: 'g5'
    }
  ],
  g6: [
    {
      id: 'e-g6-1',
      title: '感恩与成长：《岁月里的那盏明灯》',
      gradeTier: '六年级 · 情感沉淀与小升初叙事',
      promptText: '在你的成长道路上，总有一束光曾温暖你前行的脚步。可能是长辈的叮咛、老师的期许，或朋友的陪伴。写一篇真情实感的记叙文。',
      outlineAdvice: [
        '用一个具有象征意义的物象（如灯光、旧毛衣、批语）作为全文线索',
        '选取一两件具体细腻的真实事件，写出情感的波折与顿悟',
        '结尾深化情感，表达对成长与感恩的理解'
      ],
      keyTechniques: [
        '以小见大，善于捕捉眼神、语调、背影等微妙细节',
        '避免空洞喊口号，让情感在行动中自然流淌'
      ],
      modelEssay: {
        title: '书桌旁的那碗热姜汤',
        paragraphs: [
          '寒夜漫漫，每当笔尖在试卷上沙沙作响感到疲惫时，鼻尖总会隐隐飘来一丝温热辛甜的姜香。那不仅是一碗汤的温度，更是母亲用岁月熬煮的无声深情。',
          '临近毕业考的那个冬天格外寒冷。数学模拟考的失利像一块巨石压在心头，我把自己反锁在房间里，赌气地一遍遍演算着错题。夜已经深了，窗外寒风拍打着玻璃，屋内的空气仿佛都要凝固。忽然，门把手被极轻微地转动了一下，母亲轻轻端着一个粗瓷大碗走了进来。',
          '她没有多问一句成绩，只是把那碗热气腾腾的红糖姜汤放在桌角，又默默走过来，将一件厚马甲披在我的肩头。她的手粗糙而温暖，轻轻拂过我紧绷的额头，轻声说：“孩子，歇歇眼睛吧。路长着呢，只要往前走，就没有跨不过的坎。”',
          '母亲转身退出的瞬间，台灯下我瞥见她鬓角新添的几缕白发。那一刻，泪水无声地滴落在演算纸上。那碗姜汤顺着喉咙流下，驱散了整夜的寒意。原来，真正的爱从不需要惊天动地的誓言，它就藏在这热气升腾的寻常岁月里，化作照亮我勇毅前行的无尽光芒。'
        ]
      },
      paragraphAnnotations: [
        '第1段：以嗅觉记忆（辛甜姜香）破题，诗意而温情，迅速扣紧读者心弦。',
        '第2段：渲染气氛，将考试失利的低落与冬夜严寒融为一体。',
        '第3段：神态、语言、动作细节交织，一句“路长着呢”温厚有力。',
        '第4段：升华主题，白发与泪水呼应，完成了由少年任性到懂事感恩的心灵蜕变。'
      ],
      goodPhrases: ['沙沙作响', '无声深情', '紧绷的额头', '热气腾腾', '勇毅前行'],
      sampleMaterials: [
        { title: '慈母情怀', quote: '谁言寸草心，报得三春晖。' },
        { title: '汪曾祺名言', quote: '家人闲坐，灯火可亲。' }
      ],
      gradeId: 'g6'
    }
  ],
  g7: [
    {
      id: 'e-g7-1',
      title: '叙事散文：《走过那片静谧的雨季》',
      gradeTier: '七年级 · 初中写景抒情',
      promptText: '生活有晴亦有雨。面对成长中的困惑或波折，你是如何走过的？以此为题，写一篇情景交融的记叙文。',
      outlineAdvice: [
        '环境与心境呼应（雨天与心中的烦躁/失落）',
        '转折点：雨中偶遇的一个人物、一株植物或一次对话引发的顿悟',
        '雨过天晴，心境澄澈开朗'
      ],
      keyTechniques: [
        '借鉴朱自清《春》或老舍写景技法，用色彩与声音渲染氛围',
        '双重线索推进：外部天气变化与内心心理历程同步演进'
      ],
      modelEssay: {
        title: '风雨归舟处见晴朗',
        paragraphs: [
          '江南的梅雨季总是连绵不绝。淅淅沥沥的雨丝织成了一张灰蒙蒙的网，将青石板路与粉墙黛瓦尽数笼罩。那阵子刚踏入初中，面对陡然增多的课业和陌生的同学，我的心情也如同这阴雨一般潮湿泥泞。',
          '那是一个周五的傍晚，我独自撑伞走在归家的小巷里。雨水顺着伞骨滴落，打湿了鞋袜。正当我低头叹息时，耳畔忽然传来一阵苍劲悠扬的笛声。循声望去，小巷尽头的老茶馆檐下，一位盲人老者正悠然抚笛。雨水顺着瓦当如串珠般跌落，碎成满地清脆的音符，而老人神色安详，笛声清澈如泉，完全没有被这恼人的淫雨所侵扰。',
          '我驻足倾听，心头那些烦躁与委屈，竟在这一曲澄净的乐音中慢慢融化消解。盲者眼前虽是无尽长夜，心中却有一片朗朗晴空；我不过遇到了一点点学业上的适应挫折，又何必将自己困在愁云惨雾之中？',
          '不知不觉中，雨停了。夕阳从云层的裂隙中倾泻而下，把湿漉漉的青石板照得金光熠熠。走过那片雨季，我忽然明白：风雨往往是生活的常客，真正决定景致的，是心头那方永不熄灭的晴光。'
        ]
      },
      paragraphAnnotations: [
        '第1段：以江南梅雨铺展氛围，情景交融。',
        '第2段：偶遇盲人抚笛，声音与水滴交织，极富电影质感。',
        '第3段：由听笛引发灵魂叩问，由表及里，思辨力初现。',
        '第4段：云开日出，心结解开，结尾哲理金句收束有力。'
      ],
      goodPhrases: ['连绵不绝', '淅淅沥沥', '瓦当如串珠', '愁云惨雾', '晴光破云'],
      sampleMaterials: [
        { title: '苏轼词作', quote: '竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。料峭春风吹酒醒，微冷，山头斜照却相迎。' }
      ],
      gradeId: 'g7'
    }
  ],
  g8: [
    {
      id: 'e-g8-1',
      title: '立论文初探：《谈“专心致志”的现代价值》',
      gradeTier: '八年级 · 议论文初步',
      promptText: '在信息爆炸、短视频和弹窗纷扰的今天，专注力成为了稀缺品质。请确立论点，写一篇结构清晰的议论文。',
      outlineAdvice: [
        '提出论点：心无旁骛方能成就深邃卓越（引论）',
        '分论点一：专注是积淀学识、突破难关的基石（正面举例）',
        '分论点二：浮躁分心导致浅尝辄止与平庸（反面举例/对比论证）',
        '联系现实青年成长，发出专注修行的呼吁（结论）'
      ],
      keyTechniques: [
        '三段论式论证结构（提出问题、分析问题、解决问题）',
        '道理论证与事例论证相结合'
      ],
      modelEssay: {
        title: '守一处宁静，铸非凡人生',
        paragraphs: [
          '庄子曾言：“用志不分，乃凝于神。”古往今来，凡在学术、艺术或工程领域有所建树者，无一不是在喧嚣尘世中守住一方书桌、耐住十年孤寂的专注之人。在现代生活节奏日益加快的今天，专注力更显弥足珍贵。',
          '专注是成就卓越事业的基石。物理学家牛顿为了潜心推导万有引力定律，曾数日闭门不出，甚至将怀表当成鸡蛋扔进沸锅；屠呦呦带领团队在千百次翻阅古籍、上百次实验失败中不改初衷，终于提取出拯救千万人生命的青蒿素。他们之所以能穿透迷雾抵达真理的彼岸，正是因为把全部的心智聚焦于一处，如同凸透镜汇聚日光，终能迸发出炽热的火花。',
          '反观当下，数字媒介的繁冗推送切割着人们的注意力。许多人在碎片化的浏览中浅尝辄止，在频仍的诱惑前心猿意马。看似忙碌终日，实则思想贫瘠，难以触及知识的核心与精神的高地。若任由浮躁蔓延，个体便会丧失深度思考的敏锐，文明的发展亦会流于表象。',
          '古人云：“咬定青山不放松。”面对纷繁复杂的世界，唯有学会给心灵做减法，戒除浮躁，心无旁骛，我们才能在日复一日的沉潜中破茧成蝶，书写无愧于时代的沉稳答卷。'
        ]
      },
      paragraphAnnotations: [
        '第1段：引庄子古训破题，鲜明提出中心论点。',
        '第2段：正例充沛，凸透镜的比喻极具说服力。',
        '第3段：正反对比，切中当下信息碎片的时代痛点，体现批判意识。',
        '第4段：总结全篇，给出方法呼吁，铿锵有力。'
      ],
      goodPhrases: ['用志不分', '弥足珍贵', '心猿意马', '沉潜自持', '破茧成蝶'],
      sampleMaterials: [
        { title: '荀子《劝学》', quote: '蚓无爪牙之利，筋骨之强，上食埃土，下饮黄泉，用心一也。蟹六跪而二螯，非蛇鳝之穴无可寄托者，用心躁也。' }
      ],
      gradeId: 'g8'
    }
  ],
  g9: [
    {
      id: 'e-g9-1',
      title: '中考满分作文：《中流砥柱：在风浪中挺立》',
      gradeTier: '九年级 · 中考典范与综合表达',
      promptText: '生活如奔涌的江河，既有平川缓流，亦有惊涛骇浪。当我们站在风口浪尖，何为支撑我们不被击垮的力量？请结合自身或社会生活，写一篇文章。',
      outlineAdvice: [
        '题记或开篇：以浪涛中坚立的砥柱为象征，点明坚守初心之可贵',
        '主体：从历史沧桑到时代英雄，再落笔到寻常奋斗者与自我内心的力量',
        '升华：中流击水，少年当自强'
      ],
      keyTechniques: [
        '融记叙、议论、抒情于一体的文化大散文笔调',
        '排比段落构建充沛气势，增强阅读感染力'
      ],
      modelEssay: {
        title: '风浪里的定海神针',
        paragraphs: [
          '大河奔流，非坦途无碍；青峰屹立，历雷殛不移。人生天地间，总有一些坚如磐石的信仰与风骨，在惊涛拍岸处化作中流砥柱，守护着民族的脊梁与前行的航程。',
          '回望历史星河，屈原怀石投江，是汨罗江畔不与浊世同流合污的砥柱；司马迁身陷囹圄而发愤著《史记》，是风雨飘摇中延续文脉的砥柱；鲁迅以笔代戈呐喊彷徨，是至暗时刻唤醒民众灵魂的砥柱。他们以血肉之躯迎向逆流，不畏摧折，使得华夏文明在数千年风霜雨雪中始终生生不息。',
          '放眼当今盛世，这样的风骨从未断绝。在海拔数千米的风雪边陲，年轻的戍边战士化作界碑，以青春热血筑成保家卫国的砥柱；在实验室的深夜灯光下，白发苍苍的科学家攻克核心关键技术，以赤子之心铸就大国重器的砥柱；在疫情肆虐时，无数逆行医护白衣为甲，以凡人之躯托举生命希望的砥柱。',
          '中考在即，青春正当时。站在人生的第一个风浪关口，我们亦当涤荡内心的怯懦与浮躁。以知识为舟，以毅力为舵，将自己锻造成为狂风刮不倒、暴雨浇不灭的坚实支柱。中流击水，浪遏飞舟，奔赴属于我们的星辰大海！'
        ]
      },
      paragraphAnnotations: [
        '第1段：开篇气象万千，对仗起笔，立意高远。',
        '第2段：纵向梳理历史长河中的精神先贤，排比用典，厚重如铁。',
        '第3段：横向铺展当代现实中的平民英雄，时代感鲜明，热血激荡。',
        '第4段：收束回青年自身的中考与成长使命，昂扬励志，催人奋进。'
      ],
      goodPhrases: ['雷殛不移', '中流砥柱', '以笔代戈', '白衣为甲', '浪遏飞舟'],
      sampleMaterials: [
        { title: '苏轼《潮州韩文公庙碑》', quote: '匹夫而为百世师，一言而为天下法。此皆算算然，与天地并存，非偶然也。' }
      ],
      gradeId: 'g9'
    }
  ],
  g10: [
    {
      id: 'e-g10-1',
      title: '思辨大散文：《重读经典：在时间的深渊里打捞永恒》',
      gradeTier: '高一年级 · 经典阅读与深度反思',
      promptText: '有人认为“经典离今天的生活太远，读网文碎片更实用”；亦有人认为“不读经典，灵魂无所附丽”。请谈谈你对当下重读经典的思考。',
      outlineAdvice: [
        '现象引入：快餐文化与经典边缘化的时代语境',
        '本质探究：经典之所以为经典，在于它回答了人类永恒的精神困境',
        '实践路径：如何以当代视角与先哲对话，实现精神的重构'
      ],
      keyTechniques: [
        '概念辨析（经典与流行、短暂与永恒、实用与无用）',
        '运用金岳霖、钱钟书等学者论断深化思辨厚度'
      ],
      modelEssay: {
        title: '在时间的风暴中守护灯塔',
        paragraphs: [
          '卡尔维诺在《为什么读经典》中曾写道：“经典作品是那些你经常听人家说‘我正在重读……’而不是‘我正在读……’的书。”在这个算法推送、短平快资讯遮蔽深度的时代，重读经典并非泥古不化的怀旧，而是一场在精神荒原上探寻生命本源的壮阔远征。',
          '经典之所以能穿越时空的漫长剥蚀而历久弥新，盖因它触碰了人类共通的情感幽微与命运困境。两千年前苏子在赤壁扁舟上对“逝者如斯”的惆怅，何尝不是每一个现代人在面对时间飞逝时的内心叹喟？杜甫在茅屋为秋风所破时发出的“大庇天下寒士俱欢颜”，又何尝不依然震撼着当代每一个渴望公平正义的心灵？经典并非供奉于高阁的冰冷化石，而是一团永不熄灭的薪火，随时准备点燃后世探索者的思考。',
          '当下流行的功利主义阅读，往往将书籍视为即时兑现的技能工具包。然而，那些看似“无用”的诗词哲思，恰恰构成了人格中最坚固的底色。正如庄子所言“人皆知有用之用，而莫知无用之用也”。经典赋予我们的，不是即刻变现的技巧，而是一副审视世界的深邃眼光，一种在纷乱现实中不随波逐流的清醒定力。',
          '翻开一部泛黄的经典，便是与千百年来最智慧的头脑并肩而立。在喧嚣浮躁的时代狂潮里，让我们做一名执着的航行者，借由经典的星光，校正灵魂的罗盘，驶向辽阔深邃的精神彼岸。'
        ]
      },
      paragraphAnnotations: [
        '第1段：引用卡尔维诺名言，精准定义经典内核，反思快餐时代。',
        '第2段：援引苏轼、杜甫实例，阐明经典跨越时空的人性共通性。',
        '第3段：深化思辨，借庄子“无用之大用”直击实用主义阅读弊端。',
        '第4段：以星光罗盘作结，富有意境美与哲理号召力。'
      ],
      goodPhrases: ['泥古不化', '精神荒原', '情感幽微', '无用之大用', '灵魂罗盘'],
      sampleMaterials: [
        { title: '卡尔维诺', quote: '一部经典作品是一本每次重读都像初读那样带来发现的书。' },
        { title: '庄子《人间世》', quote: '山木自寇也，膏火自煎也。人皆知有用之用，而莫知无用之用也。' }
      ],
      gradeId: 'g10'
    }
  ],
  g11: [
    {
      id: 'e-g11-1',
      title: '哲学思辨文：《本手、妙手与俗手之辩》',
      gradeTier: '高二年级 · 围棋之道与人生成长',
      promptText: '围棋有三手：“本手”合乎棋理，“妙手”出人意料，“俗手”貌似合理实则损局。请结合个人成长或社会现实，写一篇辩证议论文。',
      outlineAdvice: [
        '厘清核心内涵：本手是基石，妙手是化境，俗手是急功近利之患',
        '层层递进：无本手之笃实，绝无妙手之神韵；贪恋妙手者往往自陷俗手',
        '现实观照：治学、科技创新与国家发展的“本手”精神'
      ],
      keyTechniques: [
        '辩证法（量变与质变、现象与本质）',
        '多层次结构推演，避免扁平化罗列'
      ],
      modelEssay: {
        title: '笃行本手，方得妙境',
        paragraphs: [
          '弈棋之道，如人生行径。“本手”合乎棋理，看似平淡无奇，实为根基所在；“妙手”灵光乍现，出人意表，乃水到渠成之造化；而“俗手”自作聪明，急于求成，终致满盘皆输。三者相较，最耐人寻味者莫过于：妙手不可强求，唯有在千锤百炼的本手中沉潜，方能迎来脱胎换骨的飞跃。',
          '本手是万丈高楼得以拔地而起的深固地基。当今社会，浮躁之风往往催生出对“妙手”的盲目狂热。创业者妄图凭借一句惊人概念一夜暴富，学者试图绕过枯燥扎实的文献整理寻找速成捷径。殊不知，脱离了扎实本手的所谓“妙手”，不过是沙滩筑塔、空中楼阁，最易沦为自欺欺人的“俗手”。王羲之临池学书池水尽黑，方有《兰亭序》的天下第一行书；曹雪芹披阅十载、增删五次，方铸就《红楼梦》的不朽篇章。古往今来之大成者，何曾有一人不是将“本手”下到了极致？',
          '然而，守本手绝非因循守旧、固步自封。本手所积蓄的规律与定力，恰是打破常规、孕育妙手的温床。如同深海潜流，唯有日夜兼程的厚积，才能在拍岸那一瞬激起震撼天地的狂澜。在核心科技攻关的当下，我们需要千千万万科研人员甘坐冷板凳下好“本手棋”，更需要破除桎梏、敢为人先的“妙手”创新。',
          '不驰于空想，不骛于虚声。年轻一代当以守本手的笃实涵养底气，以远避俗手的清醒警策自身，终能在人生的棋局上，落子无悔，行至妙境。'
        ]
      },
      paragraphAnnotations: [
        '第1段：准确界定三者辩证逻辑，提出“妙手源于本手”的核心论点。',
        '第2段：破立结合，深刻剖析好高骛远导致的“俗手”恶果，并举王羲之、曹雪芹名例佐证。',
        '第3段：进阶辨析：本手不是保守，而是创新的土壤，逻辑严密无漏洞。',
        '第4段：引用李大钊名言收官，将围棋术语升华为时代青年的修身纲领。'
      ],
      goodPhrases: ['脱胎换骨', '沙滩筑塔', '披阅十载', '冷板凳', '落子无悔'],
      sampleMaterials: [
        { title: '苏轼《稼说送张琥》', quote: '博观而约取，厚积而薄发，吾告子止于此矣。' },
        { title: '李大钊', quote: '凡事都要脚踏实地去作，不驰于空想，不骛于虚声，而惟求真的陆沉。' }
      ],
      gradeId: 'g11'
    }
  ],
  g12: [
    {
      id: 'e-g12-1',
      title: '高考满分示范：《何以安顿浮躁时代的诗意与理性》',
      gradeTier: '高三年级 · 高考决胜与哲理思辨',
      promptText: '当代科技突飞猛进，物质财富空前充裕，然而人们的精神世界却时常感到虚无与焦灼。如何在理性与诗意、物质与精神之间安顿我们的人生？请写一篇深刻的议论性散文。',
      outlineAdvice: [
        '破题：时代两难境遇——工具理性的狂欢与价值理性的失落',
        '论证层一：理性构筑文明生存的硬度与秩序',
        '论证层二：诗意滋养精神栖居的温度与深情',
        '终极融合：物我不二，以理性执舵，以诗意扬帆'
      ],
      keyTechniques: [
        '高阶哲学概念有机融入（海德格尔“诗意栖居”、韦伯“祛魅与复魅”）',
        '句式如黄钟大吕，典雅与现代张力兼具'
      ],
      modelEssay: {
        title: '执理性之炬，赋生命以诗情',
        paragraphs: [
          '海德格尔曾发问：“在贫困的时代，诗人何为？”身处算力奔涌、算法统治日常的数字纪元，我们拥有了远超前人的认知广度与物质丰裕，却也常常在精密算法与效率至上的钢铁洪流中，陷入意义匮乏的精神空谷。如何在理性的精密秩序中，守护好那抹摇曳的人文诗意，构成了当代青年不可回避的心灵课题。',
          '不可否认，理性是人类摆脱蒙昧、丈量宇宙的不朽火炬。从伽利略的望远镜到巡天探海的“天宫”“蛟龙”，人类凭借严密的逻辑推演与求真探索，打破了迷信的神话，构筑起现代文明璀璨的大厦。倘若失去理性的审慎与严谨，社会便会坠入盲从狂热的迷障。理性赋予我们清醒的眼光，让我们得以在芜杂信息中明辨是非，在风云变幻中持守正道。',
          '然而，若将理性推向极端，将一切价值还原为冰冷的数据与KPI的量化，世界便会被彻底“祛魅”，沦为失去温情的机械丛林。正因如此，我们更需诗意的救赎。诗意并非文人的无病呻吟，而是对天地生灵的博大悲悯，是对一朵花开、一泓清泉的由衷惊叹，是对“明月松间照”的澄澈向往。正如木心所言：“文学是可爱的，生活的可爱便由此而来。”诗意赋予理性以灵魂的温度，使我们的奋斗不仅仅是为了生存的温饱，更是为了领略存在本身的崇高与美好。',
          '“知其不可奈何而安之若命”，是一种达观；“虽千万人吾往矣”，是一种担当。新时代的跋涉者，当如飞鸟拥有双翼：一翼是以理性求索世界规律的冷峻与笃实，一翼是以诗意观照人间万象的温热与从容。唯有执理性之炬划破迷惘，赋生命以诗意慰藉苍生，我们方能在这纷繁复杂的时代大潮中，活出丰盈、坦荡而高贵的生命姿态。'
        ]
      },
      paragraphAnnotations: [
        '第1段：以海德格尔名问开局，视野宏阔，直指当下工具理性泛滥的时代痛点。',
        '第2段：肯定理性的基石价值，行文公正客观，杜绝片面偏激。',
        '第3段：峰回路转，指出过度理性导致的“精神机械化”，并由木心名言引出诗意对人性的终极温润。',
        '第4段：合二为一，双翼齐飞，化用庄子与孟子典故，金句迭出，极具考场震慑力。'
      ],
      goodPhrases: ['诗意栖居', '钢铁洪流', '祛魅与复魅', '博大悲悯', '双翼齐飞'],
      sampleMaterials: [
        { title: '海德格尔', quote: '人诗意地栖居在大地之上。' },
        { title: '荷尔德林', quote: '如果生活是纯粹的劳作，那么人何不在天地间诗意地生活？' }
      ],
      gradeId: 'g12'
    }
  ]
};

// 考试试题库 (涵盖选择、判断、近反义词填空、语病辨析、文言翻译等)
export const EXAMS_DATA: Record<GradeId, ExamQuestion[]> = {
  g1: [
    {
      id: 'q-g1-1',
      category: 'character',
      type: 'choice',
      question: '请问下面哪个生字的读音是“rì”？',
      options: ['A. 月', 'B. 日', 'C. 山', 'D. 水'],
      correctAnswer: 1,
      explanation: '“日”读音为“rì”，表示太阳或日子。A为yuè，C为shān，D为shuǐ。',
      gradeId: 'g1',
      difficulty: 'easy'
    },
    {
      id: 'q-g1-2',
      category: 'character',
      type: 'choice',
      question: '“山”字一共有几笔？',
      options: ['A. 2笔', 'B. 3笔', 'C. 4笔', 'D. 5笔'],
      correctAnswer: 1,
      explanation: '“山”的笔顺是：竖、竖折、竖，一共3笔。',
      gradeId: 'g1',
      difficulty: 'easy'
    },
    {
      id: 'q-g1-3',
      category: 'word',
      type: 'choice',
      question: '“快乐”的反义词是下面哪一个？',
      options: ['A. 开心', 'B. 高兴', 'C. 伤心', 'D. 欢快'],
      correctAnswer: 2,
      explanation: '“快乐”指心情舒畅开心，反义词是“伤心”或“难过”。',
      gradeId: 'g1',
      difficulty: 'easy'
    },
    {
      id: 'q-g1-4',
      category: 'sentence',
      type: 'choice',
      question: '填入合适词语使句子更生动：“弯弯的月儿像_____。”',
      options: ['A. 大圆盘', 'B. 小小的小船', 'C. 火球', 'D. 荷叶'],
      correctAnswer: 1,
      explanation: '弯弯的月牙形状两头尖，最像轻巧可爱的小船；圆月才像大圆盘。',
      gradeId: 'g1',
      difficulty: 'easy'
    }
  ],
  g2: [
    {
      id: 'q-g2-1',
      category: 'character',
      type: 'choice',
      question: '“碧”字的偏旁部首是下面哪一个？',
      options: ['A. 王', 'B. 白', 'C. 石', 'D. 日'],
      correctAnswer: 2,
      explanation: '“碧”是上下结构，部首是底部的“石”字旁。',
      gradeId: 'g2',
      difficulty: 'easy'
    },
    {
      id: 'q-g2-2',
      category: 'word',
      type: 'choice',
      question: '“生机勃勃”常用来形容什么景象？',
      options: ['A. 冬天大雪纷飞、万籁俱寂', 'B. 春回大地、植物动物充满生命活力', 'C. 教室里鸦雀无声', 'D. 机器坏了不能运转'],
      correctAnswer: 1,
      explanation: '“生机勃勃”形容生命力旺盛，充满生机与活力的美好景象。',
      gradeId: 'g2',
      difficulty: 'easy'
    },
    {
      id: 'q-g2-3',
      category: 'sentence',
      type: 'choice',
      question: '下列句子中，哪一句运用了“拟人”的修辞手法？',
      options: ['A. 大象的耳朵像两把大蒲扇。', 'B. 小溪唱着欢快的歌儿向前奔跑。', 'C. 天上的白云真白啊。', 'D. 他的个子比爸爸还要高。'],
      correctAnswer: 1,
      explanation: '“小溪唱着欢快的歌儿向前奔跑”把没有生命的小溪赋予了人的歌唱与奔跑动作，是拟人句；A为比喻句。',
      gradeId: 'g2',
      difficulty: 'medium'
    }
  ],
  g3: [
    {
      id: 'q-g3-1',
      category: 'word',
      type: 'choice',
      question: '成语“栩栩如生”中“栩栩”的意思是？',
      options: ['A. 慢慢走动的样子', 'B. 生动活泼、如同活物的样子', 'C. 声音极其响亮', 'D. 颜色特别鲜艳'],
      correctAnswer: 1,
      explanation: '“栩栩”指生动逼真宛若活着的样子。典出庄周梦蝶“栩栩然胡蝶也”。',
      gradeId: 'g3',
      difficulty: 'medium'
    },
    {
      id: 'q-g3-2',
      category: 'sentence',
      type: 'choice',
      question: '下列句子中，标点符号使用完全正确的一项是？',
      options: [
        'A. “春天真美啊！”小红由衷地赞叹道。',
        'B. 小红由衷地赞叹道：“春天真美啊”！',
        'C. “春天真美啊”！小红由衷地赞叹道。',
        'D. 小红由衷地赞叹道：“春天真美啊！”。'
      ],
      correctAnswer: 0,
      explanation: '感叹号在引号内部，提示语在后，句末用句号收尾，A项格式完全正确。',
      gradeId: 'g3',
      difficulty: 'medium'
    }
  ],
  g4: [
    {
      id: 'q-g4-1',
      category: 'word',
      type: 'choice',
      question: '在《观潮》中，“那声音如同千万辆坦克同时开动”运用的修辞手法是？',
      options: ['A. 拟人', 'B. 比喻与夸张', 'C. 反问', 'D. 对偶'],
      correctAnswer: 1,
      explanation: '将潮水奔涌之声比作“千万辆坦克”，既运用了比喻，又运用了夸张手法增强气势。',
      gradeId: 'g4',
      difficulty: 'medium'
    },
    {
      id: 'q-g4-2',
      category: 'sentence',
      type: 'choice',
      question: '下列词语搭配完全恰当的一项是？',
      options: ['A. 保护环境 · 改善生活 · 提高水平', 'B. 保护时间 · 改进工作 · 增进友谊', 'C. 珍惜视力 · 发扬优点 · 克服困难', 'D. 端正态度 · 养成习惯 · 发展智力'],
      correctAnswer: 3,
      explanation: 'D项“端正态度”、“养成习惯”、“发展智力”动宾搭配严谨规范。A项“改善生活”和“提高水平”虽通，但D项词语搭配最为规整典范。',
      gradeId: 'g4',
      difficulty: 'hard'
    }
  ],
  g5: [
    {
      id: 'q-g5-1',
      category: 'sentence',
      type: 'choice',
      question: '下列句子没有语病的一项是？',
      options: [
        'A. 经过老师的悉心指导，使我的作文水平有了显著提高。',
        'B. 校园里开满了五颜六色的红花。',
        'C. 能否坚持体育锻炼，是保持身体健康的关键。',
        'D. 宽阔的操场上，同学们正在热烈地讨论着即将举办的运动会。'
      ],
      correctAnswer: 3,
      explanation: 'A项滥用介词“经过……使……”缺少主语；B项“五颜六色”与“红花”矛盾；C项两面对一面（能否 vs 是）；D项语句通顺无语病。',
      gradeId: 'g5',
      difficulty: 'hard'
    }
  ],
  g6: [
    {
      id: 'q-g6-1',
      category: 'reading',
      type: 'choice',
      question: '“高山流水觅知音”讲述的是哪两位古代人物的深厚知己情谊？',
      options: ['A. 廉颇与蔺相如', 'B. 伯牙与钟子期', 'C. 管仲与鲍叔牙', 'D. 李白与杜甫'],
      correctAnswer: 1,
      explanation: '“伯牙鼓琴，钟子期善听”，子期死后伯牙绝弦，成为“高山流水”千古知己佳话。',
      gradeId: 'g6',
      difficulty: 'medium'
    }
  ],
  g7: [
    {
      id: 'q-g7-1',
      category: 'sentence',
      type: 'choice',
      question: '“海日生残夜，江春入旧年”中，“生”与“入”两字的妙处在于？',
      options: [
        'A. 仅仅说明了早晨太阳升起和春天到来的自然时间。',
        'B. 运用拟人手法，将昼夜更迭与季节转换人格化，寓新旧交替之哲理于景中。',
        'C. 说明作者当时思乡心切，急于回到故乡。',
        'D. 运用夸张手法，突出了江面雾气浓重。'
      ],
      correctAnswer: 1,
      explanation: '“生”与“入”赋予“海日”与“江春”以自主灵动的人性，写出了新事物在旧事物中孕育蓬勃的自然哲理。',
      gradeId: 'g7',
      difficulty: 'medium'
    }
  ],
  g8: [
    {
      id: 'q-g8-1',
      category: 'reading',
      type: 'choice',
      question: '朱自清散文《背影》中，最打动人心、四次出现的感情聚焦点是？',
      options: ['A. 父亲的马褂', 'B. 车站那一兜朱红的橘子', 'C. 父亲攀爬月台买橘子的艰难“背影”', 'D. 祖母去世的哀伤消息'],
      correctAnswer: 2,
      explanation: '全文以“背影”为核心线索，四次写到背影，特别是望父买橘爬月台的特定背影，将如山父爱刻画入微。',
      gradeId: 'g8',
      difficulty: 'medium'
    }
  ],
  g9: [
    {
      id: 'q-g9-1',
      category: 'sentence',
      type: 'choice',
      question: '范仲淹《岳阳楼记》中体现中国历代知识分子宏伟担当情怀的千古名句是？',
      options: [
        'A. 浮光跃金，静影沉璧。',
        'B. 居庙堂之高则忧其民，处江湖之远则忧其君。',
        'C. 先天下之忧而忧，后天下之乐而乐。',
        'D. 衔远山，吞长江，浩浩汤汤，横无际涯。'
      ],
      correctAnswer: 2,
      explanation: '“先天下之忧而忧，后天下之乐而乐”超越了个人宠辱，成为士大夫乃至中华民族最高境界的家国担当。',
      gradeId: 'g9',
      difficulty: 'medium'
    }
  ],
  g10: [
    {
      id: 'q-g10-1',
      category: 'sentence',
      type: 'choice',
      question: '苏轼《赤壁赋》中“自其不变者而观之，则物与我皆无尽也”所表达的哲理思想是？',
      options: [
        'A. 肯定神仙的存在与长生不老的真实性。',
        'B. 从万物永恒存在的辩证角度化解生命短促的悲观虚无，展现超脱旷达胸襟。',
        'C. 表达对政治失意的彻底绝望与消极逃避。',
        'D. 批评曹操不懂得欣赏自然美景。'
      ],
      correctAnswer: 1,
      explanation: '苏轼借水与月的辩证法则，阐发变与不变的哲学关系，从而破除“哀吾生之须臾”的感伤，达到精神的永恒超脱。',
      gradeId: 'g10',
      difficulty: 'hard'
    }
  ],
  g11: [
    {
      id: 'q-g11-1',
      category: 'sentence',
      type: 'choice',
      question: '鲁迅在《拿来主义》中运用的主要论证逻辑是？',
      options: [
        'A. 先破后立，通过对“闭关主义”和“送去主义”的归谬批驳，确立自主甄别的拿来主义。',
        'B. 纯粹从理论上推导唯物主义历史观。',
        'C. 仅仅通过对比古代与现代的科技发展水平。',
        'D. 详细讲述作者留学日本的个人回忆录。'
      ],
      correctAnswer: 0,
      explanation: '鲁迅采用杂文锋利的“先破后立”逻辑，层层揭示送去主义的危害，最终提出“运用脑髓、放出眼光、自己来拿”的核心论点。',
      gradeId: 'g11',
      difficulty: 'hard'
    }
  ],
  g12: [
    {
      id: 'q-g12-1',
      category: 'sentence',
      type: 'choice',
      question: '围棋术语“本手”、“妙手”与“俗手”在辩证议论文中最核心的逻辑支撑关系是？',
      options: [
        'A. 妙手比本手高级得多，应当一开始就抛弃本手、直接追求妙手。',
        'B. 本手是基石与前提，妙手是本手沉潜熟练后的自然造化，急功近利贪求妙手则易坠入俗手。',
        'C. 俗手只要反复练习，就能自动变成妙手。',
        'D. 三者完全独立，在棋局与人生中毫无关联。'
      ],
      correctAnswer: 1,
      explanation: '厚积薄发、实事求是。本手乃根基，妙手乃升华，违背规律妄图速成则沦为俗手，此为最严密的辩证结构。',
      gradeId: 'g12',
      difficulty: 'hard'
    }
  ]
};

// 预习引导指引结构（针对各年级特色）
export interface PreviewGuide {
  gradeId: GradeId;
  lessonTitle: string;
  steps: {
    title: string;
    description: string;
    keyPoints: string[];
  }[];
  questions: {
    question: string;
    hint: string;
  }[];
}

export const PREVIEW_GUIDES: Record<GradeId, PreviewGuide> = {
  g1: {
    gradeId: 'g1',
    lessonTitle: '《天地人 · 金木水火土》启蒙导学',
    steps: [
      {
        title: '第一步：声韵初读',
        description: '跟着语音朗读生字拼音，辨清声调（阴平、阳平、上声、去声）。',
        keyPoints: ['日（rì）为第四声', '月（yuè）为第四声', '水（shuǐ）为第三声拐弯']
      },
      {
        title: '第二步：象形溯源',
        description: '观察古汉字的图画演变，体会古人“仰观天文，俯察地理”的造字智慧。',
        keyPoints: ['“日”像太阳之形', '“山”像峰峦三座连绵', '掌握从上到下、先横后竖的笔顺']
      },
      {
        title: '第三步：生活联想',
        description: '在生活大自然中寻找这些汉字的朋友。',
        keyPoints: ['日光、月亮、春水、青山']
      }
    ],
    questions: [
      {
        question: '为什么古人造“水”字时，中间一条长竖波浪，两边各有几点水滴？',
        hint: '因为水流奔涌向前，激起晶莹浪花，中间是主河道，两旁是溅起的水珠。'
      }
    ]
  },
  g2: {
    gradeId: 'g2',
    lessonTitle: '《找春天 · 寻觅物候》探索预习',
    steps: [
      {
        title: '第一步：认读字词',
        description: '快速认读“晨、碧、暖、芬芳、生机勃勃”，注意轻声与多音字。',
        keyPoints: ['“碧绿”的色彩美感', '“芬芳”的双口双草头字形']
      },
      {
        title: '第二步：朗读感悟',
        description: '出声朗读课文短文，感受春风拂面、万物生长的欢快节律。',
        keyPoints: ['读出小草探头的俏皮感', '体会桃花绽放的喜悦']
      },
      {
        title: '第三步：画龙点睛',
        description: '找出课文中描写春天的动词，想一想如果换掉好不好。',
        keyPoints: ['探、遮、掩、笑、唱']
      }
    ],
    questions: [
      {
        question: '课文为什么说小草是“春天的眉毛”？这种比喻好在哪里？',
        hint: '因为初春刚萌出的小草细细的、柔柔的、淡淡的一层绿，形状宛如少女美丽的秀眉。'
      }
    ]
  },
  g3: {
    gradeId: 'g3',
    lessonTitle: '《荷花 · 观察与联想》深度预习',
    steps: [
      {
        title: '第一步：感知全篇',
        description: '通读全文，理清作者闻荷香、看荷姿、想荷舞的观察行文顺序。',
        keyPoints: ['闻到清香 → 奔向荷塘 → 观赏姿态 → 幻化荷花']
      },
      {
        title: '第二步：品析好句',
        description: '标出描写荷花姿态的“挨挨挤挤”、“冒出来”等传神动词。',
        keyPoints: ['“冒”字写出了荷叶生机勃勃的旺盛生命力']
      },
      {
        title: '第三步：修辞揣摩',
        description: '体会作者把自己想象成一朵荷花的奇妙想象力。',
        keyPoints: ['微风吹过翩翩起舞，微风停下静静伫立']
      }
    ],
    questions: [
      {
        question: '如果把“白荷花在这些大圆盘之间冒出来”中的“冒”换成“长”，效果有什么不同？',
        hint: '“冒”字写出了荷花生机勃勃、迫不及待探出身来的精神劲头；而“长”字则平淡无奇。'
      }
    ]
  },
  g4: {
    gradeId: 'g4',
    lessonTitle: '《观潮 · 天下奇观》预习导读',
    steps: [
      {
        title: '第一步：把握时间脉络',
        description: '理清课文按照“潮来前 → 潮来时 → 潮退后”的时间推移脉络。',
        keyPoints: ['潮来前：风平浪静，人山人海', '潮来时：闷雷滚动，水天相接，横贯江面', '潮退后：风号浪吼，江面漫涨']
      },
      {
        title: '第二步：视听感官聚焦',
        description: '圈画写声音（隆隆响声、山崩地裂）与写形态（白线、战马）的关键语句。',
        keyPoints: ['千万匹白色战马齐头并进']
      }
    ],
    questions: [
      {
        question: '作者是怎样层层递进描写钱塘江大潮由远及近的声音变化的？',
        hint: '从最初远处“闷雷滚动”，到近处“如同千万辆坦克开动”，最后到眼前“山崩地裂”。'
      }
    ]
  },
  g5: {
    gradeId: 'g5',
    lessonTitle: '《白鹭 · 水墨精妙》审美预习',
    steps: [
      {
        title: '第一步：初读明理',
        description: '朗读郭沫若散文《白鹭》，体会“白鹭是一首精巧的诗”的含义。',
        keyPoints: ['色素的配合，身段的大小，一切都很适宜']
      },
      {
        title: '第二步：画意品味',
        description: '欣赏文章描绘的三幅画卷：水田钓鱼图、枝头独立图、黄昏低飞图。',
        keyPoints: ['韵味在寻常生活之间展现']
      }
    ],
    questions: [
      {
        question: '为什么作者在开头说白鹭是“一首精巧的诗”，结尾又说它是“一首韵在骨子里的散文诗”？',
        hint: '精巧指外形的和谐匀称；韵在骨子里则指其悠然自得、超凡脱俗的神韵与内在风骨。'
      }
    ]
  },
  g6: {
    gradeId: 'g6',
    lessonTitle: '《伯牙绝弦 · 知音探微》文言预读',
    steps: [
      {
        title: '第一步：断句朗读',
        description: '根据文言句读节奏朗读课文，注意停顿与语气虚词。',
        keyPoints: ['善哉/峨峨兮/若泰山', '伯牙/谓/世再无知音']
      },
      {
        title: '第二步：字词对照',
        description: '对照注释疏通字面意思，重点掌握“鼓、善哉、洋洋、绝弦”。',
        keyPoints: ['鼓：弹奏；绝：割断，再不弹奏']
      }
    ],
    questions: [
      {
        question: '“钟子期死，伯牙破琴绝弦，终身不复鼓琴”表现了伯牙怎样炽热而悲壮的情感？',
        hint: '世界上再也没有懂他琴音与心声的人了，知音逝去，琴声已死，展现了超越世俗功利的至真情谊。'
      }
    ]
  },
  g7: {
    gradeId: 'g7',
    lessonTitle: '《春 · 朗诵与生机》深度导引',
    steps: [
      {
        title: '第一步：音画入境',
        description: '有感情朗读朱自清的名篇，体悟春草、春花、春风、春雨与迎春五幅图景。',
        keyPoints: ['盼春 → 绘春 → 赞春']
      },
      {
        title: '第二步：修辞研习',
        description: '剖析文中精彩的比喻、拟人与排比句式。',
        keyPoints: ['“像刚落地的娃娃”、“像小姑娘”、“像健壮的青年”三段递进赞春']
      }
    ],
    questions: [
      {
        question: '文章结尾将春天比作“娃娃”、“小姑娘”、“健壮的青年”，这一排列顺序能否调换？',
        hint: '不能调换。这一顺序形象生动地体现了生命的成长演进规律：从初生萌芽到娇艳生长，再到茁壮成熟，脉络严谨。'
      }
    ]
  },
  g8: {
    gradeId: 'g8',
    lessonTitle: '《背影 · 父爱细节》预习探究',
    steps: [
      {
        title: '第一步：通读知事',
        description: '梳理家庭遭遇变故（祖母去世、父亲赋闲）的背景与车站送别的曲折过程。',
        keyPoints: ['家境颓唐惨淡，衬托父爱厚重']
      },
      {
        title: '第二步：动词研读',
        description: '重点研读第六自然段父亲过铁道买橘子的动作链。',
        keyPoints: ['走、探、穿、爬、攀、缩、微倾']
      }
    ],
    questions: [
      {
        question: '文中作者几次流泪？每一次流泪的原因和情感内涵有什么不同？',
        hint: '四次流泪：第一次为家境凄惨伤心；第二次见父亲买橘艰难而感动；第三次为离别感伤；第四次读父亲来信时内疚与思念。'
      }
    ]
  },
  g9: {
    gradeId: 'g9',
    lessonTitle: '《岳阳楼记 · 古典士大夫情怀》文言预习',
    steps: [
      {
        title: '第一步：背诵熟读',
        description: '掌握“衔远山，吞长江”、“浮光跃金，静影沉璧”等千古写景名句。',
        keyPoints: ['阴雨霏霏的感极而悲 vs 春和景明的宠辱皆忘']
      },
      {
        title: '第二步：文眼挖掘',
        description: '理解“不以物喜，不以己悲”与“先天下之忧而忧，后天下之乐而乐”的递进逻辑。',
        keyPoints: ['从写景抒情到议论升华，达到士人精神巅峰']
      }
    ],
    questions: [
      {
        question: '“不以物喜，不以己悲”体现了一种怎样的人生态度？在今天我们该如何践行？',
        hint: '不因为外物好坏或个人得失而欣喜若狂或悲伤沮丧。启示我们在面对顺境与逆境时保持内心定力与豁达格局。'
      }
    ]
  },
  g10: {
    gradeId: 'g10',
    lessonTitle: '《赤壁赋 · 儒释道融汇与哲思》预习导读',
    steps: [
      {
        title: '第一步：朗读成诵',
        description: '体会苏轼主客问答式的赋体特点，感受文字音律的抑扬顿挫。',
        keyPoints: ['月出于东山之上，徘徊于斗牛之间']
      },
      {
        title: '第二步：主客辩难',
        description: '理清客之悲（人生苦短、英雄安在）与苏子之乐（变与不变、物各有主）的哲学交锋。',
        keyPoints: ['由乐入悲，由悲归达']
      }
    ],
    questions: [
      {
        question: '苏轼如何利用“江水”与“明月”这两个意象巧妙解开客人的虚无悲戚？',
        hint: '水逝而未往，月缺而未损。从不变处观之，万物与我皆无穷无尽；且天地自然耳得之而为声，目遇之而成色，尽情享受自然之赐即可。'
      }
    ]
  },
  g11: {
    gradeId: 'g11',
    lessonTitle: '《拿来主义 · 鲁迅杂文论战艺术》预习',
    steps: [
      {
        title: '第一步：时代背景',
        description: '了解20世纪30年代中国对待外来文化的闭关保守与全盘盲从两种极端倾向。',
        keyPoints: ['批判“闭关主义”与“送去主义”']
      },
      {
        title: '第二步：大宅子譬喻',
        description: '分析文中“大宅子”比喻文化遗产，对大烟馆、姨太太等意象的取舍与改造策略。',
        keyPoints: ['占有、挑选、毁灭、使用']
      }
    ],
    questions: [
      {
        question: '鲁迅笔下的“拿来主义”同今天的“对外开放与文化互鉴”有何内在相通之处？',
        hint: '都强调保持文化主体性，既不固步自封盲目排外，也不丧失立场盲目跪拜，而是有甄别、有创新地吸收一切有益文明成果。'
      }
    ]
  },
  g12: {
    gradeId: 'g12',
    lessonTitle: '《高考论述文高分思辨思维模型》高考预习',
    steps: [
      {
        title: '第一步：概念拆解与二元对立',
        description: '学习高考作文核心命题的二元或多元思辨（如守正与创新、速度与温度、平凡与崇高）。',
        keyPoints: ['避免非黑即白的扁平化思维，寻找深层互补与辩证转化']
      },
      {
        title: '第二步：论证架构推演',
        description: '掌握“提出论点 → 本质辨析 → 现实现象批驳 → 辩证路径建构 → 时代升华”的高分五段论。',
        keyPoints: ['理据充实，逻辑严密，金句生辉']
      }
    ],
    questions: [
      {
        question: '优秀的高考议论文为何必须包含“驳论/反思”这一环节？',
        hint: '因为单纯的立论容易显得盲目自说自话，通过预设立场的反思与反驳（如指出误区或极端情况），更能彰显思考的严密与思维的广度。'
      }
    ]
  }
};

// 科举文人段位体系 (学士品阶奖励)
export const SCHOLAR_RANKS = [
  { title: '启蒙童生', minInk: 0, maxInk: 100, desc: '发蒙启智，初握羊毫，读诵天地自然。', sealColor: '#78716C' },
  { title: '敏学秀才', minInk: 101, maxInk: 300, desc: '字句熟稔，登堂入室，通晓诗书礼义。', sealColor: '#0284C7' },
  { title: '登科举人', minInk: 301, maxInk: 650, desc: '学识渐博，乡试高中，文采斐然动众。', sealColor: '#16A34A' },
  { title: '经世贡士', minInk: 651, maxInk: 1100, desc: '学问贯通，会试脱颖，怀抱经世济民志。', sealColor: '#D97706' },
  { title: '殿试进士', minInk: 1101, maxInk: 1800, desc: '金殿对策，文章传世，深得儒雅之道。', sealColor: '#9333EA' },
  { title: '探花及第', minInk: 1801, maxInk: 2700, desc: '风度翩翩，才冠群芳，名列前茅。', sealColor: '#EA580C' },
  { title: '连中榜眼', minInk: 2701, maxInk: 3800, desc: '笔落惊风，学富五车，德才兼备名士。', sealColor: '#B83A2D' },
  { title: '魁星状元', minInk: 3801, maxInk: 999999, desc: '文曲下凡，独占鳌头，登峰造极一代宗师。', sealColor: '#831843' }
];

// 经典成就徽章
export const SYSTEM_BADGES = [
  { id: 'b_checkin_1', name: '晨诵晓读', desc: '完成首次每日打卡签到', icon: 'Sun', category: 'streak' },
  { id: 'b_checkin_3', name: '笔耕不辍', desc: '连续学习打卡达3天', icon: 'Flame', category: 'streak' },
  { id: 'b_checkin_7', name: '日就月将', desc: '连续学习打卡达7天', icon: 'Award', category: 'streak' },
  { id: 'b_char_master', name: '字斟句酌', desc: '掌握当前年级全部生字', icon: 'BookOpen', category: 'learning' },
  { id: 'b_word_master', name: '词采华茂', desc: '掌握当前年级全部精品词汇', icon: 'Sparkles', category: 'learning' },
  { id: 'b_essay_first', name: '妙笔生花', desc: '完成首篇作文练习并获得智能评析', icon: 'PenTool', category: 'mastery' },
  { id: 'b_exam_pass', name: '金榜题名', desc: '在模拟测试中获得100分满分', icon: 'Trophy', category: 'exam' },
  { id: 'b_scholar_ink', name: '墨海泛舟', desc: '累积获得超过500滴墨水学分', icon: 'Feather', category: 'mastery' }
];

// 默认完整课程配置（作为唯一基准课程数据源）
export const DEFAULT_CURRICULUM: CurriculumConfig = {
  characters: CHARACTERS_DATA,
  words: WORDS_DATA,
  sentences: SENTENCES_DATA,
  essays: ESSAYS_DATA,
  exams: EXAMS_DATA
};

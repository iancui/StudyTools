/**
 * 服务端可信测验答案库。
 * 从 StudyTools main 的 EXAMS_DATA 抽取；服务端独立核验，不能信任浏览器提交的 score。
 * 选项文本已去掉 A/B/C/D 前缀，便于稳定洗牌。
 */
export const CHINESE_EXAM_BANK = {
  g1: [
    {
      id: 'q-g1-1',
      category: 'character',
      type: 'choice',
      question: '请问下面哪个生字的读音是“rì”？',
      options: ['月', '日', '山', '水'],
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
      options: ['2笔', '3笔', '4笔', '5笔'],
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
      options: ['开心', '高兴', '伤心', '欢快'],
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
      options: ['大圆盘', '小小的小船', '火球', '荷叶'],
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
      options: ['王', '白', '石', '日'],
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
      options: ['冬天大雪纷飞、万籁俱寂', '春回大地、植物动物充满生命活力', '教室里鸦雀无声', '机器坏了不能运转'],
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
      options: ['大象的耳朵像两把大蒲扇。', '小溪唱着欢快的歌儿向前奔跑。', '天上的白云真白啊。', '他的个子比爸爸还要高。'],
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
      options: ['慢慢走动的样子', '生动活泼、如同活物的样子', '声音极其响亮', '颜色特别鲜艳'],
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
        '“春天真美啊！”小红由衷地赞叹道。',
        '小红由衷地赞叹道：“春天真美啊”！',
        '“春天真美啊”！小红由衷地赞叹道。',
        '小红由衷地赞叹道：“春天真美啊！”。'
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
      options: ['拟人', '比喻与夸张', '反问', '对偶'],
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
      options: ['保护环境 · 改善生活 · 提高水平', '保护时间 · 改进工作 · 增进友谊', '珍惜视力 · 发扬优点 · 克服困难', '端正态度 · 养成习惯 · 发展智力'],
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
        '经过老师的悉心指导，使我的作文水平有了显著提高。',
        '校园里开满了五颜六色的红花。',
        '能否坚持体育锻炼，是保持身体健康的关键。',
        '宽阔的操场上，同学们正在热烈地讨论着即将举办的运动会。'
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
      options: ['廉颇与蔺相如', '伯牙与钟子期', '管仲与鲍叔牙', '李白与杜甫'],
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
        '仅仅说明了早晨太阳升起和春天到来的自然时间。',
        '运用拟人手法，将昼夜更迭与季节转换人格化，寓新旧交替之哲理于景中。',
        '说明作者当时思乡心切，急于回到故乡。',
        '运用夸张手法，突出了江面雾气浓重。'
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
      options: ['父亲的马褂', '车站那一兜朱红的橘子', '父亲攀爬月台买橘子的艰难“背影”', '祖母去世的哀伤消息'],
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
        '浮光跃金，静影沉璧。',
        '居庙堂之高则忧其民，处江湖之远则忧其君。',
        '先天下之忧而忧，后天下之乐而乐。',
        '衔远山，吞长江，浩浩汤汤，横无际涯。'
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
        '肯定神仙的存在与长生不老的真实性。',
        '从万物永恒存在的辩证角度化解生命短促的悲观虚无，展现超脱旷达胸襟。',
        '表达对政治失意的彻底绝望与消极逃避。',
        '批评曹操不懂得欣赏自然美景。'
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
        '先破后立，通过对“闭关主义”和“送去主义”的归谬批驳，确立自主甄别的拿来主义。',
        '纯粹从理论上推导唯物主义历史观。',
        '仅仅通过对比古代与现代的科技发展水平。',
        '详细讲述作者留学日本的个人回忆录。'
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
        '妙手比本手高级得多，应当一开始就抛弃本手、直接追求妙手。',
        '本手是基石与前提，妙手是本手沉潜熟练后的自然造化，急功近利贪求妙手则易坠入俗手。',
        '俗手只要反复练习，就能自动变成妙手。',
        '三者完全独立，在棋局与人生中毫无关联。'
      ],
      correctAnswer: 1,
      explanation: '厚积薄发、实事求是。本手乃根基，妙手乃升华，违背规律妄图速成则沦为俗手，此为最严密的辩证结构。',
      gradeId: 'g12',
      difficulty: 'hard'
    }
  ]
} as const;

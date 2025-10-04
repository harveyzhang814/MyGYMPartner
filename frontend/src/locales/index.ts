import { zhCN } from './zh-CN';
import { enUS } from './en-US';

export type Language = 'zh-CN' | 'en-US';

export interface LocaleConfig {
  language: Language;
  name: string;
  flag: string;
}

export const supportedLanguages: LocaleConfig[] = [
  { language: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { language: 'en-US', name: 'English', flag: '🇺🇸' }
];

export const defaultLanguage: Language = 'zh-CN';

export const locales = {
  'zh-CN': zhCN,
  'en-US': enUS
};

// 获取当前语言
export const getCurrentLanguage = (): Language => {
  const stored = localStorage.getItem('language');
  return (stored as Language) || defaultLanguage;
};

// 设置语言
export const setLanguage = (language: Language): void => {
  localStorage.setItem('language', language);
  // 触发语言切换事件
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
};

// 获取翻译文本
export const t = (key: string, language?: Language): string => {
  const currentLang = language || getCurrentLanguage();
  const locale = locales[currentLang];
  
  if (!locale) {
    console.warn(`Locale ${currentLang} not found`);
    return key;
  }

  const keys = key.split('.');
  let value: any = locale;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key ${key} not found in ${currentLang}`);
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
};

// 肌肉群预设数据
export const muscleGroupPresets = {
  'zh-CN': [
    { value: 'chest-upper', label: '胸部/上胸' },
    { value: 'chest-middle', label: '胸部/中胸' },
    { value: 'chest-lower', label: '胸部/下胸' },
    { value: 'back-lats', label: '背部/背阔肌' },
    { value: 'back-upper-traps', label: '背部/斜方肌上部' },
    { value: 'back-middle-traps', label: '背部/斜方肌中部' },
    { value: 'back-lower-traps', label: '背部/斜方肌下部' },
    { value: 'back-rhomboids', label: '背部/菱形肌' },
    { value: 'back-erector-spinae', label: '背部/竖脊肌' },
    { value: 'back-teres-major', label: '背部/大圆肌' },
    { value: 'back-teres-minor', label: '背部/小圆肌' },
    { value: 'back-infraspinatus', label: '背部/冈下肌' },
    { value: 'back-supraspinatus', label: '背部/冈上肌' },
    { value: 'shoulders-front-deltoid', label: '肩部/三角肌前束' },
    { value: 'shoulders-lateral-deltoid', label: '肩部/三角肌中束' },
    { value: 'shoulders-rear-deltoid', label: '肩部/三角肌后束' },
    { value: 'arms-biceps-long-head', label: '手臂/肱二头肌长头' },
    { value: 'arms-biceps-short-head', label: '手臂/肱二头肌短头' },
    { value: 'arms-brachialis', label: '手臂/肱肌' },
    { value: 'arms-brachioradialis', label: '手臂/肱桡肌' },
    { value: 'arms-triceps-long-head', label: '手臂/肱三头肌长头' },
    { value: 'arms-triceps-lateral-head', label: '手臂/肱三头肌外侧头' },
    { value: 'arms-triceps-medial-head', label: '手臂/肱三头肌内侧头' },
    { value: 'forearms-flexors', label: '前臂/屈肌群' },
    { value: 'forearms-extensors', label: '前臂/伸肌群' },
    { value: 'legs-quadriceps', label: '腿部/股四头肌' },
    { value: 'legs-hamstrings', label: '腿部/腘绳肌群' },
    { value: 'legs-gluteus-maximus', label: '腿部/臀大肌' },
    { value: 'legs-gluteus-medius', label: '腿部/臀中肌' },
    { value: 'legs-gluteus-minimus', label: '腿部/臀小肌' },
    { value: 'legs-calf-gastrocnemius', label: '腿部/小腿腓肠肌' },
    { value: 'legs-calf-soleus', label: '腿部/小腿比目鱼肌' },
    { value: 'core-rectus-abdominis', label: '核心/腹直肌' },
    { value: 'core-external-obliques', label: '核心/腹外斜肌' },
    { value: 'core-internal-obliques', label: '核心/腹内斜肌' },
    { value: 'core-transverse-abdominis', label: '核心/腹横肌' },
    { value: 'core-iliopsoas', label: '核心/髂腰肌' },
    { value: 'neck-sternocleidomastoid', label: '颈部/胸锁乳突肌' },
    { value: 'neck-scalenes', label: '颈部/斜角肌' }
  ],
  'en-US': [
    { value: 'chest-upper', label: 'Chest/Upper Pectoral' },
    { value: 'chest-middle', label: 'Chest/Middle Pectoral' },
    { value: 'chest-lower', label: 'Chest/Lower Pectoral' },
    { value: 'back-lats', label: 'Back/Latissimus Dorsi' },
    { value: 'back-upper-traps', label: 'Back/Upper Trapezius' },
    { value: 'back-middle-traps', label: 'Back/Middle Trapezius' },
    { value: 'back-lower-traps', label: 'Back/Lower Trapezius' },
    { value: 'back-rhomboids', label: 'Back/Rhomboids' },
    { value: 'back-erector-spinae', label: 'Back/Erector Spinae' },
    { value: 'back-teres-major', label: 'Back/Teres Major' },
    { value: 'back-teres-minor', label: 'Back/Teres Minor' },
    { value: 'back-infraspinatus', label: 'Back/Infraspinatus' },
    { value: 'back-supraspinatus', label: 'Back/Supraspinatus' },
    { value: 'shoulders-front-deltoid', label: 'Shoulders/Front Deltoid' },
    { value: 'shoulders-lateral-deltoid', label: 'Shoulders/Lateral Deltoid' },
    { value: 'shoulders-rear-deltoid', label: 'Shoulders/Rear Deltoid' },
    { value: 'arms-biceps-long-head', label: 'Arms/Biceps Long Head' },
    { value: 'arms-biceps-short-head', label: 'Arms/Biceps Short Head' },
    { value: 'arms-brachialis', label: 'Arms/Brachialis' },
    { value: 'arms-brachioradialis', label: 'Arms/Brachioradialis' },
    { value: 'arms-triceps-long-head', label: 'Arms/Triceps Long Head' },
    { value: 'arms-triceps-lateral-head', label: 'Arms/Triceps Lateral Head' },
    { value: 'arms-triceps-medial-head', label: 'Arms/Triceps Medial Head' },
    { value: 'forearms-flexors', label: 'Forearms/Flexors' },
    { value: 'forearms-extensors', label: 'Forearms/Extensors' },
    { value: 'legs-quadriceps', label: 'Legs/Quadriceps' },
    { value: 'legs-hamstrings', label: 'Legs/Hamstrings' },
    { value: 'legs-gluteus-maximus', label: 'Legs/Gluteus Maximus' },
    { value: 'legs-gluteus-medius', label: 'Legs/Gluteus Medius' },
    { value: 'legs-gluteus-minimus', label: 'Legs/Gluteus Minimus' },
    { value: 'legs-calf-gastrocnemius', label: 'Legs/Calf Gastrocnemius' },
    { value: 'legs-calf-soleus', label: 'Legs/Calf Soleus' },
    { value: 'core-rectus-abdominis', label: 'Core/Rectus Abdominis' },
    { value: 'core-external-obliques', label: 'Core/External Obliques' },
    { value: 'core-internal-obliques', label: 'Core/Internal Obliques' },
    { value: 'core-transverse-abdominis', label: 'Core/Transverse Abdominis' },
    { value: 'core-iliopsoas', label: 'Core/Iliopsoas' },
    { value: 'neck-sternocleidomastoid', label: 'Neck/Sternocleidomastoid' },
    { value: 'neck-scalenes', label: 'Neck/Scalenes' }
  ]
};

// 设备类型预设数据
export const equipmentPresets = {
  'zh-CN': [
    { value: 'bodyweight', label: '自重' },
    { value: 'dumbbell', label: '哑铃' },
    { value: 'barbell', label: '杠铃' },
    { value: 'kettlebell', label: '壶铃' },
    { value: 'resistanceBand', label: '阻力带' },
    { value: 'cable', label: '绳索' },
    { value: 'machine', label: '器械' },
    { value: 'bench', label: '训练凳' },
    { value: 'pullUpBar', label: '引体向上杆' },
    { value: 'medicineBall', label: '药球' },
    { value: 'trx', label: 'TRX' },
    { value: 'other', label: '其他' }
  ],
  'en-US': [
    { value: 'bodyweight', label: 'Bodyweight' },
    { value: 'dumbbell', label: 'Dumbbell' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'kettlebell', label: 'Kettlebell' },
    { value: 'resistanceBand', label: 'Resistance Band' },
    { value: 'cable', label: 'Cable' },
    { value: 'machine', label: 'Machine' },
    { value: 'bench', label: 'Bench' },
    { value: 'pullUpBar', label: 'Pull-up Bar' },
    { value: 'medicineBall', label: 'Medicine Ball' },
    { value: 'trx', label: 'TRX' },
    { value: 'other', label: 'Other' }
  ]
};

// 难度等级预设数据
export const difficultyPresets = {
  'zh-CN': [
    { value: 'BEGINNER', label: '初级' },
    { value: 'INTERMEDIATE', label: '中级' },
    { value: 'ADVANCED', label: '高级' }
  ],
  'en-US': [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' }
  ]
};

// 分类预设数据
export const categoryPresets = {
  'zh-CN': [
    { value: 'strength', label: '力量训练' },
    { value: 'cardio', label: '有氧运动' },
    { value: 'flexibility', label: '柔韧性' },
    { value: 'balance', label: '平衡训练' },
    { value: 'plyometric', label: '爆发力训练' },
    { value: 'mobility', label: '灵活性训练' },
    { value: 'rehabilitation', label: '康复训练' }
  ],
  'en-US': [
    { value: 'strength', label: 'Strength Training' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'balance', label: 'Balance Training' },
    { value: 'plyometric', label: 'Plyometric' },
    { value: 'mobility', label: 'Mobility' },
    { value: 'rehabilitation', label: 'Rehabilitation' }
  ]
};

// 获取预设选项
export const getPresetOptions = (type: 'muscleGroups' | 'equipment' | 'difficulty' | 'categories', language?: Language) => {
  const currentLang = language || getCurrentLanguage();
  const presets = {
    muscleGroups: muscleGroupPresets,
    equipment: equipmentPresets,
    difficulty: difficultyPresets,
    categories: categoryPresets
  };
  
  return presets[type][currentLang] || presets[type]['zh-CN'];
};

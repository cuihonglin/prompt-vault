// ===== Built-in Community Prompts =====
const BUILTIN_PROMPTS = [
  {
    id: 'builtin-1',
    title: 'AI 写作润色大师',
    category: 'writing',
    content: '你是一位专业的中文写作润色专家。请对以下文本进行润色优化，要求：\n1. 保持原意不变\n2. 提升文字的流畅度和表达力\n3. 修正语法错误\n4. 优化句式结构\n5. 标注你做了哪些修改及理由\n\n原文：\n{{待润色文本}}',
    tags: ['写作', '润色', '中文'],
    note: '适用于文章、邮件、报告等各类文本的润色优化',
    favorite: false,
    copyCount: 0,
    createdAt: '2026-01-01'
  },
  {
    id: 'builtin-2',
    title: '高级代码审查员',
    category: 'coding',
    content: '你是一位拥有10年经验的高级软件工程师，请对以下{{编程语言}}代码进行详细的Code Review：\n\n```\n{{代码内容}}\n```\n\n请从以下维度进行审查：\n1. 代码质量和可读性\n2. 潜在的Bug和边界情况\n3. 性能优化建议\n4. 安全性问题\n5. 最佳实践建议\n\n请以表格形式输出问题列表，包含：问题位置、严重程度（高/中/低）、问题描述、修复建议。',
    tags: ['编程', 'Code Review', '代码质量'],
    note: '支持任意编程语言的代码审查',
    favorite: false,
    copyCount: 0,
    createdAt: '2026-01-01'
  },
  {
    id: 'builtin-3',
    title: '小红书爆款文案',
    category: 'marketing',
    content: '你是一位小红书爆款内容创作者。请根据以下主题，创作一篇小红书风格的种草文案：\n\n主题：{{产品或话题}}\n目标人群：{{目标受众}}\n\n要求：\n1. 标题：使用emoji + 吸睛标题，不超过20字\n2. 正文：800字以内，分段清晰\n3. 语气：亲切、真实、有感染力\n4. 加入3-5个互动话题标签\n5. 结尾设置互动引导语\n6. 使用适当的emoji装饰',
    tags: ['营销', '小红书', '文案', '种草'],
    note: '适用于产品种草、生活分享、好物推荐等场景',
    favorite: false,
    copyCount: 0,
    createdAt: '2026-01-01'
  },
  {
    id: 'builtin-4',
    title: '专业多语言翻译',
    category: 'translation',
    content: '你是一位精通多国语言的专业翻译，擅长{{源语言}}到{{目标语言}}的翻译。请翻译以下内容：\n\n{{待翻译内容}}\n\n翻译要求：\n1. 准确传达原文含义，不遗漏信息\n2. 符合目标语言的表达习惯和语法规范\n3. 保持原文的语气和风格\n4. 专业术语使用行业标准译法\n5. 如有文化差异，请在括号中注释说明\n\n请输出：\n- 翻译结果\n- 关键术语对照表\n- 翻译难点说明（如有）',
    tags: ['翻译', '多语言', '专业'],
    note: '支持中英日韩法德西等多语言互译',
    favorite: false,
    copyCount: 0,
    createdAt: '2026-01-01'
  },
  {
    id: 'builtin-5',
    title: '商务邮件撰写',
    category: 'business',
    content: '请帮我撰写一封专业的商务邮件：\n\n收件人身份：{{收件人}}\n邮件目的：{{目的}}\n关键信息：{{关键内容}}\n语气要求：{{正式/友好/紧急}}\n\n要求：\n1. 符合商务邮件礼仪\n2. 结构清晰（问候-正文-行动要求-结尾）\n3. 语言专业得体\n4. 控制在300字以内\n5. 同时输出中文和英文两个版本',
    tags: ['商务', '邮件', '职场'],
    note: '适用于工作中各类商务邮件场景',
    favorite: false,
    copyCount: 0,
    createdAt: '2026-01-01'
  },
  {
    id: 'builtin-6',
    title: 'Midjourney 提示词生成',
    category: 'image',
    content: '你是一位AI绘画提示词专家，精通Midjourney的提示词编写。请根据以下描述生成高质量的Midjourney提示词：\n\n画面描述：{{画面描述}}\n风格偏好：{{风格，如赛博朋克/水彩/油画/写实}}\n\n请生成：\n1. 英文主提示词（包含主体、场景、光影、细节描述）\n2. 风格参数（--ar, --v, --s, --q 等）\n3. 3个不同风格的变体版本\n4. 中文含义解释\n\n格式：\n/imagine prompt: [提示词] --参数',
    tags: ['AI绘画', 'Midjourney', '提示词'],
    note: '快速生成高质量的AI绘画提示词',
    favorite: false,
    copyCount: 0,
    createdAt: '2026-01-01'
  },
  {
    id: 'builtin-7',
    title: 'SQL 查询生成器',
    category: 'coding',
    content: '你是一位数据库专家。请根据以下自然语言描述生成SQL查询语句：\n\n数据库类型：{{MySQL/PostgreSQL/SQLite}}\n表结构描述：{{表结构}}\n查询需求：{{自然语言描述的查询需求}}\n\n请输出：\n1. SQL查询语句（带注释）\n2. 查询逻辑解释\n3. 性能优化建议（如有索引建议）\n4. 如果需求模糊，列出你的假设',
    tags: ['编程', 'SQL', '数据库'],
    note: '用自然语言生成SQL查询',
    favorite: false,
    copyCount: 0,
    createdAt: '2026-01-01'
  },
  {
    id: 'builtin-8',
    title: '周报/日报生成器',
    category: 'business',
    content: '请根据以下工作内容，帮我生成一份{{周报/日报}}：\n\n本周工作内容（关键词即可）：\n{{工作内容}}\n\n下周计划：\n{{计划}}\n\n要求：\n1. 结构化输出（本周完成/进行中/下周计划）\n2. 用量化数据描述工作成果\n3. 语气专业、简洁\n4. 突出重点工作和成果\n5. 篇幅适中，不超过500字',
    tags: ['职场', '周报', '效率'],
    note: '快速将碎片化的工作内容组织成专业周报',
    favorite: false,
    copyCount: 0,
    createdAt: '2026-01-01'
  },
  {
    id: 'builtin-9',
    title: '面试问题准备',
    category: 'business',
    content: '我即将参加{{公司名称}}的{{职位名称}}面试。请帮我准备：\n\n1. 这个职位最可能被问到的10个面试问题\n2. 每个问题的回答框架（STAR法则）\n3. 3个我应该反问面试官的高质量问题\n4. 该公司/行业的关键知识点\n5. 常见的行为面试陷阱及应对策略\n\n我的背景：{{简要背景}}\n我的优势：{{核心优势}}',
    tags: ['职场', '面试', '求职'],
    note: '快速准备面试，提高面试通过率',
    favorite: false,
    copyCount: 0,
    createdAt: '2026-01-01'
  },
  {
    id: 'builtin-10',
    title: '学习计划制定',
    category: 'other',
    content: '你是一位学习规划专家。请帮我制定一份学习计划：\n\n学习目标：{{学习目标}}\n当前水平：{{当前水平}}\n可用时间：每天{{可用小时数}}小时\n期望周期：{{周期，如3个月}}\n\n请输出：\n1. 分阶段学习路线图\n2. 每周详细计划表\n3. 推荐学习资源（书籍/课程/网站）\n4. 里程碑和检验标准\n5. 常见误区和避坑建议',
    tags: ['学习', '规划', '自我提升'],
    note: '适用于任何技能的系统学习规划',
    favorite: false,
    copyCount: 0,
    createdAt: '2026-01-01'
  },
  {
    id: 'weekly-1',
    title: '产品需求文档生成器',
    category: 'business',
    content: '你是一位资深产品经理，拥有10年互联网产品设计经验。请根据以下信息生成一份专业的PRD（产品需求文档）：\n\n产品名称：{{产品名称}}\n核心功能：{{核心功能描述}}\n目标用户：{{目标用户群体}}\n\n请输出以下内容：\n1. 产品概述与背景\n2. 目标用户画像\n3. 核心功能列表（按优先级P0/P1/P2排列）\n4. 用户故事（至少5个，用As a...I want...So that...格式）\n5. 功能流程图描述\n6. 非功能性需求（性能、安全、兼容性）\n7. 数据埋点方案\n8. 版本迭代计划（MVP → V1 → V2）',
    tags: ['产品', 'PRD', '需求文档', '产品经理'],
    note: '适用于快速生成标准化的产品需求文档，节省产品经理50%的文档时间',
    favorite: false,
    copyCount: 0,
    createdAt: '2026-03-12'
  }
];

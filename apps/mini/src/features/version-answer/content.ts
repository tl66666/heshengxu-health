import type { Guide } from './types.js';
export type { Guide, GuideSource, TopicId } from './types.js';
import {
  ALAN,
  INTERVIEW,
  ACSM,
  WATER,
  CHINA_WATER,
  CODEX,
  PROMPT,
  lifeSource,
  CREDIT,
} from './sources.js';
import { expandedGuides } from './expanded.js';
import { chapterOrder } from './order.js';
export const REVIEWED_AT = '2026-10-13';
export const topics = [
  { id: 'muscle', title: '薄肌养成', caption: '力量、饮食与恢复', color: '#6c8a76', number: '01' },
  { id: 'sun', title: '孙学视角', caption: '先探图，再做选择', color: '#b48a52', number: '02' },
  { id: 'water', title: '大水理论', caption: '把喝水变成小习惯', color: '#769daf', number: '03' },
  {
    id: 'codex',
    title: 'Codex 实践',
    caption: '把想法变成可验证成果',
    color: '#ba8667',
    number: '04',
  },
  {
    id: 'life',
    title: '高性价比人生',
    caption: '少一点消耗，多一点余地',
    color: '#919665',
    number: '05',
  },
] as const;
const originalGuides: Guide[] = [
  {
    id: 'muscle-foundation',
    topic: 'muscle',
    title: '薄肌：先把身体底座建立起来',
    subtitle: '了解概念，再选择自己的养成方向',
    category: '健康依据＋实践整理',
    cost: '一次阅读＋建立个人目标',
    benefit: '把抽象审美变成可以记录的行动',
    sections: [
      {
        title: '先理解这个词',
        paragraphs: [
          '邵艾伦的薄肌视频讨论训练、饮食和减脂。产品用“薄肌”作为力量养成主题，具体行动由和生序整理，不能仅凭这个名字判断体脂或健康。',
          '先写下自己的方向：增强力量、减脂兼顾力量，或维持状态。相同体重的人，训练经验和恢复条件也可能不同。',
        ],
      },
      {
        title: '可以追踪什么',
        paragraphs: [
          '记录真实训练、餐次和睡眠，观察同一动作的表现。评分衡量本周目标执行，体重趋势只是其中一个观察窗口。',
          '建立一个可持续的小安排，随后根据自己的记录调整，不急着复制他人的全部作息。',
        ],
      },
    ],
    action: '建立一份适合自己的薄肌安排',
    route: '/pages/lean-muscle/SettingsPage',
    sources: [ALAN, ACSM],
  },
  {
    id: 'muscle-progress',
    topic: 'muscle',
    title: '怎样把“越练越强”记清楚',
    subtitle: '变式、器械、次数和重量要能比较',
    category: '专业指南＋实践整理',
    cost: '训练后约 2 分钟记录',
    benefit: '知道下一次需要维持或调整什么',
    sections: [
      {
        title: '给每次训练留下证据',
        paragraphs: [
          '选一个熟悉的动作，记录实际正式组。墙面俯卧撑和标准俯卧撑分别保存；不同器械重量也分开比较。',
          '以动作稳定为前提逐步调整难度。睡眠不足或身体不适时，可以维持、降阶或休息。',
        ],
      },
      {
        title: '读懂一次记录',
        paragraphs: [
          '例如同一变式、同一负重下，指定第一组从 6 次变成 8 次，是一条可核对的变化。这个例子用于说明记录方式，并非要求每个人以同样速度提高。',
          '达到自己的目标后不必加倍训练来刷分。下次继续做好动作和恢复。',
        ],
      },
    ],
    action: '保存代表动作的一次真实记录',
    route: '/pages/lean-muscle/TrainingPage',
    sources: [ACSM, ALAN],
  },
  {
    id: 'muscle-guide',
    topic: 'muscle',
    title: '薄肌圣经：训练、吃饭和恢复一起看',
    subtitle: '八章书页式指南，读完就能开始行动',
    category: '专题指南',
    cost: '每章约 2–4 分钟',
    benefit: '按当前问题找到下一步',
    sections: [
      {
        title: '从哪里开始',
        paragraphs: [
          '尚未开始训练，先读“从一次开始”；不知道怎样判断进步，读“记录与进步”；饮食和作息不稳定，先看相应章节。',
          '每章包含原则、实际场景、误区、一个行动和资料出处。你可以收藏，下一次从上次阅读位置继续。',
        ],
      },
      {
        title: '怎样使用评分',
        paragraphs: [
          '记录不完整时，分数保留为区间。完成阅读不会增加健康评分；实际训练和明确的周复盘才会成为对应证据。',
        ],
      },
    ],
    action: '打开薄肌圣经，挑一章开始',
    route: '/pages/lean-muscle/LeanMusclePage?tab=bible',
    sources: [ALAN, ACSM],
  },
  {
    id: 'sun-map',
    topic: 'sun',
    title: '孙学第一步：把“探图”变成一张清单',
    subtitle: '机会判断，从事实与未知开始',
    category: '人物观点＋个人实验',
    cost: '约 15 分钟梳理',
    benefit: '看见自己还缺哪些信息',
    sections: [
      {
        title: '原访谈说了什么',
        paragraphs: [
          '邵艾伦与孙宇晨的公开对话把“做决定前先探图”列为主题之一。它提供一个思考视角；下面的清单是产品为普通用户设计的练习。',
        ],
      },
      {
        title: '自己的三栏地图',
        paragraphs: [
          '把一个选择分成三栏：已知事实、尚未核对的假设、下一条能获取的证据。先选一个能低成本验证的问题。',
          '例如想学一项技能，先找真实岗位要求和可展示作品，再问课程能否补上具体缺口。不要把别人的成功路径直接当作自己的保证。',
        ],
      },
      {
        title: '决定前留一道边界',
        paragraphs: [
          '写下最多愿意投入多少时间和钱、什么结果会让自己停止。涉及投资、法律或重大人生选择时，需要额外核实具体条件。',
        ],
      },
    ],
    action: '为一个当前选择写下事实、假设与下一条证据',
    sources: [INTERVIEW],
    prompt:
      '帮我梳理这个选择：[选择]。请按已知事实、未核实假设、需要寻找的证据列三栏，再提出一个低成本验证步骤。标明不确定性，不替我作最终决定。',
  },
  {
    id: 'sun-data',
    topic: 'sun',
    title: '让 AI 理解处境，先整理必要的信息',
    subtitle: '把个人经历变成可回看的记录',
    category: '访谈启发＋产品实践',
    cost: '约 10 分钟整理一份摘要',
    benefit: '让讨论更具体、可检验',
    sections: [
      {
        title: '从记录开始',
        paragraphs: [
          '公开访谈讨论了 AI 与饮食、训练、工作。产品把这个主题转成可操作练习：先整理目标、限制和最近行动，不把未经核对的输出当结论。',
        ],
      },
      {
        title: '提供最少而有用的资料',
        paragraphs: [
          '给 AI 的摘要可以包含目前目标、可用时间、已经尝试的方法和实际结果。证件号码、密码、完整财务账户和他人的隐私通常不需要加入。',
          '把“帮我变好”改成“根据这一周实际记录，指出一个值得观察的问题，并给出核对方式”。',
        ],
      },
    ],
    action: '整理一份不含敏感信息的个人目标摘要',
    sources: [INTERVIEW],
    prompt:
      '我的目标是[目标]，限制是[时间/经验/资源]，最近做了[行动]，结果是[实际观察]。请区分事实与假设，只提出一个下一步和验证方法。',
  },
  {
    id: 'sun-experiment',
    topic: 'sun',
    title: '一次小实验，比一句版本口号更有用',
    subtitle: '从启发到行动，保留自己的判断',
    category: '实践整理',
    cost: '一周以内的小尝试',
    benefit: '判断方法是否适合自己',
    sections: [
      {
        title: '为想法设一个检验',
        paragraphs: [
          '把受到启发的想法写成一项具体尝试，规定时间范围与可观察结果。这里的实验方法是产品整理，不是所谓“孙学”已经验证的普遍规律。',
        ],
      },
      {
        title: '复盘四个问题',
        paragraphs: [
          '我实际做了什么？产生了什么结果？有哪条新证据？下一次继续、修改还是停止？',
          '需要更大投入之前先检查代价，不因为人物表达很有感染力就省略风险和事实核对。',
        ],
      },
    ],
    action: '选择一个小实验，写下观察结果与停止条件',
    sources: [INTERVIEW],
  },
  {
    id: 'water-meaning',
    topic: 'water',
    title: '大水理论：把热梗用成正常的喝水习惯',
    subtitle: '理解流行说法，回到实际身体需要',
    category: '健康依据＋热点说明',
    cost: '带水杯，分次记录',
    benefit: '让喝水更容易坚持',
    sections: [
      {
        title: '把口号与建议分开',
        paragraphs: [
          '“大水”是近期流行的喝水表达。这里保留这个入口名称，实际功能围绕个人目标、分次饮水和真实记录设计；不评判谁强谁弱。',
        ],
      },
      {
        title: '更有用的做法',
        paragraphs: [
          '把水放在方便取用的位置，用可持续的提醒帮助自己规律饮水。需要多少水会随活动、天气和个人状态变化。',
          '没有证据支持把大瓶水一次喝完作为所有人的健康任务。已经被要求限制液体摄入的人，应采用自己的专业指导方案。',
        ],
      },
    ],
    action: '核对个人饮水目标，记录下一次实际饮水',
    route: '/pages/water/WaterPage',
    sources: [WATER, CHINA_WATER],
  },
  {
    id: 'water-drink',
    topic: 'water',
    title: '少一杯含糖饮料，多一个可持续选择',
    subtitle: '关注喝的是什么，而不只看总量',
    category: '官方健康资料',
    cost: '从一次饮品选择开始',
    benefit: '减少不必要的含糖饮品摄入',
    sections: [
      {
        title: '先看标签和习惯',
        paragraphs: [
          'CDC 指出，用白水替代含糖饮料可以减少热量摄入。可以从最常喝的一种饮品开始观察，不需要把饮食变成惩罚。',
        ],
      },
      {
        title: '记录一个替换',
        paragraphs: [
          '今天计划喝饮料时，看看有没有自己愿意长期接受的无糖选择。把实际喝下的类型和份量记下来。',
          '记录饮品可以帮助观察习惯，但不会承诺仅靠喝水就能减脂或练出薄肌。',
        ],
      },
    ],
    action: '完成一次适合自己的饮品替换并记录',
    route: '/pages/water/WaterPage',
    sources: [WATER],
  },
  {
    id: 'water-goal',
    topic: 'water',
    title: '饮水目标要留给个人情况',
    subtitle: '“足够”比“更多”更有意义',
    category: '官方健康资料',
    cost: '约 3 分钟核对',
    benefit: '避免把统一口号套给所有人',
    sections: [
      {
        title: '为什么没有一刀切',
        paragraphs: [
          '饮水与食物中的水都构成摄入的一部分。年龄、活动、气候等因素会影响需要，具体目标也可能受医疗条件影响。',
        ],
      },
      {
        title: '在产品里怎么用',
        paragraphs: [
          '进入已有饮水模块调整个人目标。确认杯子容量后，按真实份量记录；没有喝过的部分不预先填满。',
          '心脏或肾脏相关疾病、医生要求限制液体等情况下，先采用个人指导，不参加追求最大量的挑战。',
        ],
      },
    ],
    action: '检查水杯容量和当前饮水目标',
    route: '/pages/water-goal/WaterGoalPage',
    sources: [WATER, CHINA_WATER],
  },
  {
    id: 'codex-start',
    topic: 'codex',
    title: 'Codex：先从一个小成果开始',
    subtitle: '把 AI 编程变成可检查的工作',
    category: '官方文档＋实践整理',
    cost: '一个小任务与一次检查',
    benefit: '知道做了什么、怎样验收',
    sections: [
      {
        title: '选择一个够小的任务',
        paragraphs: [
          'Codex 可用于理解代码、修改项目和验证结果。具体入口、安装和登录方式以官方快速开始为准；手机里的本指南不会直接运行桌面 Codex。',
        ],
      },
      {
        title: '任务要有边界',
        paragraphs: [
          '先选一个小页面、一份可复算的表格或一个清楚的修复。说明输入、期望输出和验收方式。',
          '第一次可以要求先解释项目结构，再提出可检查的修改范围；完成后看结果、测试和差异。',
        ],
      },
    ],
    action: '写一条有明确验收条件的 Codex 任务',
    sources: [CODEX, PROMPT],
    prompt:
      '请先了解这个项目。目标：[一个具体成果]。上下文：[相关文件或截图]。约束：[必须保留的内容]。验收：[如何检查]。先说明修改范围，完成后报告实际验证结果。',
  },
  {
    id: 'codex-prompt',
    topic: 'codex',
    title: '一个能复用的任务模板',
    subtitle: '目标、上下文、约束和验证',
    category: '官方文档＋原创模板',
    cost: '约 5 分钟填写',
    benefit: '减少来回解释和模糊交付',
    sections: [
      {
        title: '把重要的信息给全',
        paragraphs: [
          '官方提示文档强调提供有用上下文，并给出代码解释、修复和测试的工作示例。下面的模板是产品为日常使用整理的版本。',
        ],
      },
      {
        title: '写清怎样算完成',
        paragraphs: [
          '说明任务目标，指出相关文件或截图，写下必须保留的约束，然后定义检查方式。',
          '让工具报告已经运行的验证与尚未验证的部分；不要只把一张看起来好看的截图当成功证明。',
        ],
      },
    ],
    action: '把模板改成自己今天的一个真实任务',
    sources: [PROMPT],
    prompt:
      '目标：\n[希望完成的具体结果]\n上下文：\n[项目、相关文件、现状或截图]\n约束：\n[必须保留、不能改动的内容]\n验证：\n[操作流程、测试或检查方法]\n请完成必要工作，给出实际修改和验证结果。',
  },
  {
    id: 'codex-check',
    topic: 'codex',
    title: '让 AI 干活，也保留检查能力',
    subtitle: '看差异、跑验证、保护资料',
    category: '官方文档＋实践整理',
    cost: '交付后约 10 分钟检查',
    benefit: '降低误改和错误结论的风险',
    sections: [
      {
        title: '查看具体改了什么',
        paragraphs: [
          '确认改动是否围绕原目标，有没有影响不相关的文件。对功能变更，检查实际操作与结果。',
        ],
      },
      {
        title: '把验证写进任务',
        paragraphs: [
          '代码任务可以要求运行项目已有检查并报告输出。计划使用的权限、文件与外部服务要符合自己的授权范围。',
          '不要把密钥或私人资料随意粘进提示。高风险决定继续由人核对，AI 的自信语气不替代证据。',
        ],
      },
    ],
    action: '检查一次 AI 交付的差异和验证结果',
    sources: [PROMPT, CODEX],
    prompt:
      '请复核这次交付：逐项对应原需求，说明改动范围、实际执行的验证、失败项和未验证部分。检查是否误改了不相关文件，不要用推测冒充测试通过。',
  },
  {
    id: 'life-focus',
    topic: 'life',
    title: '给注意力留一段不被打断的时间',
    subtitle: '从一个小环境调整开始',
    category: '开源指南选编＋个人实验',
    cost: '不新增花费，约 5 分钟设置',
    benefit: '观察自己能否更连续地完成任务',
    sections: [
      {
        title: '选编的出发点',
        paragraphs: [
          '人生指南把注意力与作息作为精力管理主题，并逐条给出研究与限制。本页选择“减少非必要打断”作为小尝试，效果需要在自己的任务中观察。',
        ],
      },
      {
        title: '今天的最小行动',
        paragraphs: [
          '保留必要联系，把非必要通知暂时收起，在一个固定时段只做一件事。需要随时响应的岗位可以缩短时段。',
          '完成后写下实际用了多久、被打断几次，决定是否继续。',
        ],
      },
    ],
    action: '安排一个适合自己的专注时段并记录结果',
    sources: [lifeSource('03-不要浪费精力.md')],
    attribution: CREDIT,
  },
  {
    id: 'life-time',
    topic: 'life',
    title: '先看时间去向，再决定要不要优化',
    subtitle: '少做一项没有必要的重复',
    category: '开源指南选编＋实践整理',
    cost: '一次短记录，不需要额外工具',
    benefit: '找到一个可减少的日常消耗',
    sections: [
      {
        title: '不要一次改造全部生活',
        paragraphs: [
          '人生指南把时间成本与收益分开列出，供读者挑选。本页把这个思路转成一个简单记录练习。',
        ],
      },
      {
        title: '给一件事算账',
        paragraphs: [
          '记录一项经常重复的事情：每次耗时、发生频率、带来的实际收益。选择取消、简化或用已有工具辅助。',
          '节省出的时间可以留给休息，不必全部填进更多任务。',
        ],
      },
    ],
    action: '写出一个重复消耗，并选择一个简化步骤',
    sources: [lifeSource('04-不要浪费时间.md')],
    attribution: CREDIT,
  },
  {
    id: 'life-learn',
    topic: 'life',
    title: '学一个技能前，先找到实际使用场景',
    subtitle: '从可展示的成果检验学习',
    category: '开源指南选编＋实践整理',
    cost: '一次需求核对与小练习',
    benefit: '减少只有收藏、没有应用的学习',
    sections: [
      {
        title: '确认学来做什么',
        paragraphs: [
          '原指南讨论如何选技能以及怎样安排学习。本页选编为一个小练习：先确定一个具体使用场景，再选择资料。',
        ],
      },
      {
        title: '从小成果开始',
        paragraphs: [
          '选一个可以展示的结果，例如解释一个程序、做出一页作品或完成一次练习。练过之后尝试不看资料复述或重做。',
          '课程、证书和工具是否值得投入，要检查实际需求与出处；不要只依据宣传中的工资和回报承诺。',
        ],
      },
    ],
    action: '为一项技能写下使用场景和一个小成果',
    sources: [lifeSource('23-学什么技能划算.md')],
    attribution: CREDIT,
  },
  {
    id: 'life-security',
    topic: 'life',
    title: '给重要账号做一次基础检查',
    subtitle: '先保护入口，再整理信息',
    category: '开源指南选编＋安全实践',
    cost: '约 10 分钟检查',
    benefit: '减少账号与资料管理的薄弱环节',
    sections: [
      {
        title: '从最重要的账号开始',
        paragraphs: [
          '人生指南的账号安全章节讨论个人资料与访问入口。本页整理成检查清单，不要求把密码或恢复码填进本应用。',
        ],
      },
      {
        title: '检查而不是交出秘密',
        paragraphs: [
          '查看恢复邮箱或手机号是否仍可用、是否有陌生登录记录、是否可以启用适用的额外验证。确认备份方式，但不要在这里粘贴恢复码。',
          '遇到可疑链接，从已知官方入口核对，不直接沿着来路不明的消息提交资料。',
        ],
      },
    ],
    action: '检查一个重要账号的恢复方式和登录记录',
    sources: [lifeSource('14-账号与信息安全.md')],
    attribution: CREDIT,
  },
];
export const guides: Guide[] = topics.flatMap((topic) =>
  chapterOrder[topic.id].map((id) =>
    [...originalGuides, ...expandedGuides].find((guide) => guide.id === id)!,
  ),
);
export function getGuide(id: string) {
  return guides.find((guide) => guide.id === id) || null;
}
export function findGuides(
  input: { topic?: string; query?: string; saved?: readonly string[] } = {},
) {
  const query = input.query?.trim().toLowerCase() || '';
  return guides.filter(
    (guide) =>
      (!input.topic || input.topic === 'all' || guide.topic === input.topic) &&
      (!input.saved || input.saved.includes(guide.id)) &&
      (!query ||
        [
          guide.title,
          guide.subtitle,
          guide.category,
          ...guide.sections.flatMap((s) => [s.title, ...s.paragraphs]),
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)),
  );
}

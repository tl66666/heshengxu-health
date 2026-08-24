/* 禾伴 Demo — 纯前端交互原型，数据均为演示用模拟数据 */
(function () {
  "use strict";

  var ProfileUtils = window.HebanProfileUtils;
  var LS_PROFILE = "heban_profile";
  var LS_TASKS = "heban_tasks";
  var CIRC = 326.7;

  /* ---------------- 状态 ---------------- */
  var state = {
    profile: null,
    tasks: []
  };

  var DEFAULT_TASKS = [
    { id: "t1", name: "晨起拉伸", meta: "5 分钟", slot: "morning", done: false },
    { id: "t2", name: "饮水 2000ml", meta: "全天 · 约 8 杯", slot: "morning", done: false },
    { id: "t3", name: "午间散步", meta: "15 分钟", slot: "noon", done: false },
    { id: "t4", name: "睡前放松", meta: "10 分钟 · 助眠呼吸", slot: "night", done: false }
  ];

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function loadState() {
    try {
      state.profile = JSON.parse(localStorage.getItem(LS_PROFILE) || "null");
      var t = JSON.parse(localStorage.getItem(LS_TASKS) || "null");
      if (t && t.date === todayKey()) {
        state.tasks = t.tasks;
      } else {
        state.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
      }
    } catch (e) {
      state.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    }
  }

  function saveProfile() {
    localStorage.setItem(LS_PROFILE, JSON.stringify(state.profile));
  }

  function saveTasks() {
    localStorage.setItem(LS_TASKS, JSON.stringify({ date: todayKey(), tasks: state.tasks }));
  }

  /* ---------------- 工具 ---------------- */
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function toast(text) {
    var el = $("#toast");
    $("#toast-text").textContent = text;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  function setAppLocked(locked) {
    $("#tabbar").classList.toggle("is-locked", locked);
    $("#app").classList.toggle("onboarding-locked", locked);
  }

  /* ---------------- 视图切换 ---------------- */
  function showView(name) {
    if (ProfileUtils.shouldLockApp(state.profile) && name !== "onboarding") return;
    $$(".view").forEach(function (v) { v.classList.remove("active"); });
    $("#view-" + name).classList.add("active");
    $$(".tab").forEach(function (t) {
      t.classList.toggle("active", t.dataset.view === name);
    });
    window.scrollTo(0, 0);
    if (name === "data") renderTrend();
  }

  $$(".tab").forEach(function (t) {
    t.addEventListener("click", function () { showView(t.dataset.view); });
  });

  /* ---------------- 建档流程 ---------------- */
  var obData = { height: 168, weight: 62, goals: [] };

  function obShow(n) {
    $$(".ob-screen").forEach(function (s) {
      s.classList.toggle("active", s.dataset.ob === String(n));
    });
    if (String(n) === "1") updateBmiPreview();
    window.scrollTo(0, 0);
  }

  function updateBmiPreview() {
    var bmi = ProfileUtils.calculateBmi(obData.height, obData.weight);
    var category = ProfileUtils.classifyBmi(bmi);
    var advice = {
      low: "可以关注规律饮食和足够能量摄入，让身体慢慢回到更舒适的节奏。",
      normal: "你的身高体重处于较舒适的范围，继续保持规律作息和均衡饮食。",
      high: "建议从饮食结构和日常活动两侧循序调整，不需要急于求成。",
      "very-high": "建议以温和、持续的方式调整，必要时可咨询专业人士。"
    };
    $("#bmi-live-value").textContent = bmi.toFixed(1);
    $("#bmi-live-tag").textContent = category.label;
    $("#bmi-live-tag").className = "bmi-live-tag " + category.tone;
    $("#bmi-live-advice").textContent = advice[category.tone];
  }

  $$(".chips").forEach(function (group) {
    var field = group.dataset.field;
    var multi = group.dataset.multi === "1";
    group.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      if (multi) {
        chip.classList.toggle("on");
        var vals = [];
        group.querySelectorAll(".chip.on").forEach(function (c) { vals.push(c.dataset.value); });
        obData[field] = vals;
      } else {
        group.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("on"); });
        chip.classList.add("on");
        obData[field] = chip.dataset.value;
      }
    });
  });

  $("#height").addEventListener("input", function () {
    obData.height = +this.value;
    $("#h-val").textContent = this.value;
    updateBmiPreview();
  });
  $("#weight").addEventListener("input", function () {
    obData.weight = +this.value;
    $("#w-val").textContent = this.value;
    updateBmiPreview();
  });

  $$(".ob-next").forEach(function (b) {
    b.addEventListener("click", function () { obShow(b.dataset.next); });
  });
  $$(".ob-prev").forEach(function (b) {
    b.addEventListener("click", function () { obShow(b.dataset.prev); });
  });

  $("#ob-start").addEventListener("click", function () { obShow(1); });
  $("#ob-skip").addEventListener("click", function () {
    state.profile = buildProfile({ age: "26-35", gender: "female", height: 168, weight: 62, sleep: "经常熬夜", diet: "外卖为主", sport: "偶尔活动", work: "久坐办公", goals: ["改善睡眠"] });
    saveProfile();
    enterApp();
    toast("小禾为你准备了一份示例画像，随时可重新建档");
  });

  /* 画像生成逻辑：由选择推导标签与建议 */
  function buildProfile(d) {
    var tags = [];
    var advice = [];

    if (d.work === "久坐办公") tags.push("久坐时间较长");
    if (d.sleep === "经常熬夜") tags.push("睡眠规律待改善");
    if (d.sleep === "作息不定") tags.push("作息节律不稳定");
    if (d.diet === "外卖为主" || d.diet === "口味偏油") tags.push("饮食偏油腻");
    if (d.diet === "应酬较多") tags.push("应酬饮食需管理");
    if (d.sport === "几乎不动") tags.push("运动量不足");
    if (d.sport === "偶尔活动") tags.push("运动习惯养成中");
    if (d.sleep === "规律作息" && d.diet === "清淡均衡") tags.push("基础习惯良好");
    if (tags.length === 0) tags.push("生活状态均衡");

    var bmi = ProfileUtils.calculateBmi(d.height, d.weight);
    var bmiTag = ProfileUtils.classifyBmi(bmi).label;

    if (tags.indexOf("睡眠规律待改善") >= 0 || tags.indexOf("作息节律不稳定") >= 0) {
      advice.push("固定起床时间，睡前 1 小时远离手机屏幕，两周内把入睡时间提前 30 分钟");
    }
    if (tags.indexOf("饮食偏油腻") >= 0 || tags.indexOf("应酬饮食需管理") >= 0) {
      advice.push("外食优先选择清蒸与白灼做法，每餐先吃蔬菜，饮酒日安排次日清淡饮食");
    }
    if (tags.indexOf("久坐时间较长") >= 0) {
      advice.push("每 50 分钟起身活动 3 分钟，上午与下午各做一次颈肩环绕");
    }
    if (tags.indexOf("运动量不足") >= 0 || tags.indexOf("运动习惯养成中") >= 0) {
      advice.push("从每天 15 分钟快走开始，先养成节奏再谈强度");
    }
    if (advice.length === 0) {
      advice.push("保持当前节奏，重点关注饮水与睡眠质量的稳定性");
    }
    advice.push("每日饮水目标 " + Math.round(d.weight * 30) + "ml，少量多次温水为宜");

    return {
      age: d.age || "26-35",
      gender: d.gender === "male" ? "男" : "女",
      height: d.height,
      weight: d.weight,
      bmi: bmi.toFixed(1),
      bmiTag: bmiTag,
      tags: tags.slice(0, 4),
      goals: (d.goals && d.goals.length ? d.goals : ["改善睡眠"]),
      advice: advice.slice(0, 4)
    };
  }

  $("#ob-generate").addEventListener("click", function () {
    obShow(4);
    setTimeout(function () {
      state.profile = buildProfile(obData);
      saveProfile();
      renderProfileResult();
      obShow(5);
    }, 1700);
  });

  function renderProfileResult() {
    var p = state.profile;
    if (!p) return;
    $("#bmi-num").textContent = p.bmi;
    $("#bmi-tag").textContent = p.bmiTag;
    $("#profile-tags").innerHTML = p.tags.map(function (t) { return '<span class="ptag">' + t + "</span>"; }).join("");
    $("#advice-list").innerHTML = p.advice.map(function (a) { return "<li>" + a + "</li>"; }).join("");
  }

  $("#ob-done").addEventListener("click", function () {
    enterApp();
    toast("你的 7 日计划已生成，从今天的 4 件小事开始");
  });

  function enterApp() {
    setAppLocked(false);
    applyProfileEverywhere();
    showView("home");
  }

  /* 画像在各页面的应用 */
  function applyProfileEverywhere() {
    var p = state.profile;
    var tagsHtml = "";
    if (p) {
      tagsHtml = p.tags.map(function (t) { return '<span class="ptag">' + t + "</span>"; }).join("");
      $("#me-summary").textContent = p.age + " 岁 · " + p.gender + " · BMI " + p.bmi + "（" + p.bmiTag + "）· 目标：" + p.goals.join("、");
    }
    $("#chat-profile-tags").innerHTML = tagsHtml || '<span class="ptag">尚未建档</span>';
  }

  /* ---------------- 首页 ---------------- */
  function renderGreeting() {
    var h = new Date().getHours();
    var g = h < 6 ? "夜深了" : h < 12 ? "早上好" : h < 18 ? "下午好" : "晚上好";
    $("#greeting").textContent = g;
    var d = new Date();
    var week = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
    $("#today-date").textContent = (d.getMonth() + 1) + " 月 " + d.getDate() + " 日 · 星期" + week;
  }

  function setRing(el, score) {
    el.style.strokeDashoffset = String(CIRC * (1 - score / 100));
  }

  function renderTasks() {
    var done = state.tasks.filter(function (t) { return t.done; }).length;
    $("#task-progress").textContent = done + "/" + state.tasks.length;
    var score = 81 + done * 2;
    $("#score-num").textContent = score;
    setRing($("#ring-val"), score);

    var html = state.tasks.map(function (t) {
      return '<li class="task-item' + (t.done ? " done" : "") + '" data-id="' + t.id + '">' +
        '<span class="task-check">' + (t.done ? "✓" : "") + "</span>" +
        '<span class="task-name">' + t.name + "</span>" +
        '<span class="task-meta">' + t.meta + "</span></li>";
    }).join("");
    $("#home-tasks").innerHTML = html;

    var slots = { morning: [], noon: [], night: [] };
    state.tasks.forEach(function (t) { slots[t.slot].push(t); });
    ["morning", "noon", "night"].forEach(function (slot) {
      $("#plan-tasks-" + slot).innerHTML = slots[slot].map(function (t) {
        return '<li class="task-item' + (t.done ? " done" : "") + '" data-id="' + t.id + '">' +
          '<span class="task-check">' + (t.done ? "✓" : "") + "</span>" +
          '<span class="task-name">' + t.name + "</span>" +
          '<span class="task-meta">' + t.meta + "</span></li>";
      }).join("");
    });
  }

  document.addEventListener("click", function (e) {
    var item = e.target.closest(".task-item");
    if (!item) return;
    var t = state.tasks.find(function (x) { return x.id === item.dataset.id; });
    if (!t) return;
    t.done = !t.done;
    saveTasks();
    renderTasks();
    if (t.done) {
      var praise = ["做得好，身体正在记住这个习惯", "又完成一件，今天很稳", "小禾为你记录下了这一刻"];
      toast(praise[Math.floor(Math.random() * praise.length)]);
    }
  });

  $("#entry-chat").addEventListener("click", function () { showView("chat"); });
  $("#entry-record").addEventListener("click", function () {
    showView("chat");
    setTimeout(function () { sendUserMessage("我想记录一下今天的饮食、睡眠和心情"); }, 120);
  });

  $$(".program-tile").forEach(function (tile) {
    tile.addEventListener("click", function () {
      tile.classList.toggle("on");
      toast(tile.classList.contains("on") ? "已加入本周关注方案" : "已从本周关注方案移除");
    });
  });

  /* 知识条目 → 带进问题的咨询页 */
  $$(".kb-item").forEach(function (kb) {
    kb.addEventListener("click", function () {
      var map = {
        water: "夏天怎么喝水更健康？",
        sit: "久坐族怎么缓解颈椎？",
        solar: "处暑节气应该怎么养生？"
      };
      showView("chat");
      sendUserMessage(map[kb.dataset.kb] || "这篇知识讲得对吗？");
    });
  });

  /* ---------------- 咨询 ---------------- */
  var chatBody = $("#chat-body");
  var welcomed = false;

  function scrollChat() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function addMsg(role, html, srcTitle) {
    var welcome = $("#chat-welcome");
    if (welcome) welcome.remove();
    var wrap = document.createElement("div");
    wrap.className = "msg " + role;
    var avatar = role === "ai" ? '<img class="msg-avatar" src="assets/avatar.jpg" alt="小禾">' : "";
    var src = "";
    if (srcTitle) {
      src = '<div class="src-card"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 0 2 2h13"/></svg><span>知识来源 · 《' + srcTitle + '》</span></div>';
    }
    wrap.innerHTML = avatar + '<div class="msg-bubble">' + html + src + "</div>";
    chatBody.appendChild(wrap);
    scrollChat();
  }

  function addTyping() {
    var wrap = document.createElement("div");
    wrap.className = "msg ai";
    wrap.id = "typing-msg";
    wrap.innerHTML = '<img class="msg-avatar" src="assets/avatar.jpg" alt=""><div class="msg-bubble"><span class="typing"><i></i><i></i><i></i></span></div>';
    chatBody.appendChild(wrap);
    scrollChat();
  }

  function removeTyping() {
    var el = $("#typing-msg");
    if (el) el.remove();
  }

  function profileHint() {
    var p = state.profile;
    if (!p || !p.tags.length) return "";
    return "（参考你的画像：" + p.tags.slice(0, 2).join("、") + "）\n";
  }

  /* 模拟 AI 回答引擎：演示意图识别、医疗风险拦截、个性化引用、来源标注 */
  var RULES = [
    {
      name: "medical",
      match: /(什么病|是不是.*(炎|癌|病)|诊断|确诊|吃什么药|药物|处方|剂量|胸痛|胸闷|呼吸困难|剧烈|昏厥|便血|高烧|心电图|报告单|肿瘤)/,
      reply: function () {
        return "这个问题涉及症状判断与诊疗决策，超出了我能提供的范围，我不能替你下任何结论。\n如果不适正在发生或持续加重，请尽快前往正规医院就诊；情况紧急时请直接拨打 120。\n在就诊前，我可以帮你整理症状出现的时间、频率和诱因，方便医生更快了解你的情况。需要的话告诉我。";
      }
    },
    {
      name: "sleep",
      match: /(睡|失眠|熬夜|入睡|早醒|困)/,
      reply: function () {
        return "关于睡眠，结合你的情况" + profileHint() + "给你三点建议：\n1. 固定节律：每天 23:00 前入睡、7:00 起床，周末也不晚于平时 1 小时\n2. 睡前舒缓：睡前 1 小时放下手机，可做 5 分钟轻拉伸或腹式呼吸\n3. 饮食配合：下午 2 点后不喝咖啡与浓茶，晚餐七分饱\n先从第 1 条开始，坚持一周我们再调整。";
      },
      src: "中国居民睡眠健康指南"
    },
    {
      name: "diet",
      match: /(吃|外卖|饮食|油|热量|减脂|减肥|喝水|饮水|补水)/,
      reply: function () {
        return "外食场景下可以这样吃得更稳" + profileHint() + "：\n1. 点餐优先级：清蒸/白灼 > 炖煮 > 快炒 > 油炸红烧\n2. 结构搭配：一半蔬菜、四分之一蛋白、四分之一主食，先吃菜再吃饭\n3. 饮水配合：每天 " + (state.profile ? Math.round(state.profile.weight * 30) : 1800) + "ml 左右，少量多次温水更易吸收\n今天午餐就可以试一次。";
      },
      src: "中国居民膳食指南（2022）"
    },
    {
      name: "sport",
      match: /(运动|颈椎|久坐|腰酸|拉伸|跑步|膝盖|锻炼)/,
      reply: function () {
        return "针对久坐带来的颈肩问题" + profileHint() + "：\n1. 每 50 分钟起身一次，做 3 分钟颈肩环绕（缓慢画圈，各 8 次）\n2. 每天靠墙站立 2 分钟：后脑、肩胛、臀部贴墙，收下巴\n3. 本周运动目标：3 次 15 分钟快走，微微出汗即可\n动作过程中如出现刺痛或头晕，请立即停止；持续不适建议就医检查。";
      },
      src: "办公室人群科学健身指引"
    },
    {
      name: "mood",
      match: /(压力|焦虑|情绪|烦|低落|抑郁|emo|心情)/,
      reply: function () {
        return "愿意把感受说出来，本身就是很好的一步。\n可以先试试这两个小方法：\n1. 4-7-8 呼吸：吸气 4 秒、屏息 7 秒、呼气 8 秒，重复 4 轮\n2. 书写疏解：把担心的事写下来，再写一件「今天我能做的小事」\n如果低落或焦虑持续两周以上并影响到吃饭睡觉，建议寻求心理咨询师或医生的专业帮助，这不是软弱，是照顾自己的方式。";
      },
      src: "正念减压（MBSR）实践手册"
    },
    {
      name: "solar",
      match: /(节气|处暑|立秋|秋天|养生|中医|体质)/,
      reply: function () {
        return "处暑前后讲究「收」与「润」：\n1. 起居：早睡早起，比夏季提前约 30 分钟入睡\n2. 饮食：宜润不宜燥，银耳、梨、百合、莲藕正当季，少辛辣烧烤\n3. 运动：收敛强度，快走、八段锦比大汗训练更合适\n传统养生讲究顺时而为，结合你的画像" + profileHint() + "，优先调整作息收益最大。";
      },
      src: "二十四节气养生要点"
    },
    {
      name: "weak",
      match: /(乏力|没精神|累|疲惫|不舒服)/,
      reply: function () {
        return "持续的疲惫感通常和睡眠、饮食、压力三件事有关" + profileHint() + "：\n1. 先排查睡眠：近一周是否睡够 7 小时、入睡是否规律\n2. 再看饮食：早餐是否有蛋白质，午后是否靠咖啡硬撑\n3. 记录两天：把疲惫出现的时段记下来，更容易找到诱因\n这是一般性建议，不能替代诊疗。如果乏力持续超过两周或伴随其他症状，建议去医院做个基础检查。";
      },
      src: "疲劳自我管理科普手册"
    }
  ];

  var FALLBACK = "我在认真学习你的问题。基于你目前的健康画像，我先给一个大方向：规律作息、足量饮水、每天一次 15 分钟的活动，是收益最快的三件事。\n如果你想聊睡眠、饮食、运动、情绪或节气养生，直接问我就可以；涉及具体症状和用药的问题，我会帮你整理信息，但诊断请交给医生。";

  function aiReply(text) {
    addTyping();
    setTimeout(function () {
      removeTyping();
      for (var i = 0; i < RULES.length; i++) {
        if (RULES[i].match.test(text)) {
          addMsg("ai", RULES[i].reply(text), RULES[i].src);
          return;
        }
      }
      addMsg("ai", FALLBACK, null);
    }, 900 + Math.random() * 700);
  }

  function sendUserMessage(text) {
    text = (text || "").trim();
    if (!text) return;
    addMsg("user", text.replace(/</g, "&lt;"));
    aiReply(text);
  }

  $("#send-btn").addEventListener("click", function () {
    var input = $("#chat-input");
    sendUserMessage(input.value);
    input.value = "";
    input.focus();
  });
  $("#chat-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      sendUserMessage(this.value);
      this.value = "";
    }
  });
  $("#mic-btn").addEventListener("click", function () {
    toast("语音输入在正式版中开放，Demo 请先打字");
  });

  $$("#quick-pills .pill").forEach(function (pill) {
    pill.addEventListener("click", function () { sendUserMessage(pill.textContent); });
  });

  $("#profile-toggle").addEventListener("click", function () {
    var tags = $("#chat-profile-tags");
    var collapsed = tags.classList.toggle("collapsed");
    this.textContent = collapsed ? "展开" : "收起";
  });

  /* ---------------- 计划页 ---------------- */
  function renderWeek() {
    var now = new Date();
    var dow = (now.getDay() + 6) % 7;
    var monday = new Date(now);
    monday.setDate(now.getDate() - dow);
    var names = ["一", "二", "三", "四", "五", "六", "日"];
    var mock = [1, 1, 0.5, 1, 0.5, 1, 0];
    var html = "";
    for (var i = 0; i < 7; i++) {
      var d = new Date(monday);
      d.setDate(monday.getDate() + i);
      var isToday = i === dow;
      var dotColor = mock[i] === 1 ? "var(--green)" : mock[i] > 0 ? "var(--sun)" : "var(--rule)";
      if (i > dow) dotColor = "var(--rule)";
      html += '<div class="day-cell' + (isToday ? " today" : "") + '">' +
        '<span class="dow">' + names[i] + "</span>" +
        '<span class="dnum">' + d.getDate() + "</span>" +
        '<i class="ddot" style="background:' + dotColor + '"></i></div>';
    }
    $("#week-strip").innerHTML = html;
    $("#plan-week-label").textContent = "本周第 " + (dow + 1) + " 天 · 已完成 " + mock.slice(0, dow + 1).filter(function (v) { return v === 1; }).length + " 天全勤";
  }

  function renderMonth() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var first = new Date(year, month, 1);
    var days = new Date(year, month + 1, 0).getDate();
    var lead = (first.getDay() + 6) % 7;
    var today = now.getDate();
    var html = ["一", "二", "三", "四", "五", "六", "日"].map(function (n) {
      return '<div class="mday head">' + n + "</div>";
    }).join("");
    for (var i = 0; i < lead; i++) html += '<div class="mday"></div>';
    for (var d = 1; d <= days; d++) {
      var cls;
      if (d > today) cls = "future";
      else if (d === today) cls = "part";
      else {
        var r = (d * 7 + month) % 10;
        cls = r < 5 ? "full" : r < 8 ? "part" : "none";
      }
      html += '<div class="mday ' + cls + '">' + d + "</div>";
    }
    $("#month-grid").innerHTML = html;
  }

  /* ---------------- 数据页 ---------------- */
  function renderTrend() {
    var data = [78, 80, 79, 82, 81, 84, 85];
    var labels = ["六", "日", "一", "二", "三", "四", "五"];
    var w = 320, h = 130, pad = 22, min = 70, max = 90;
    var step = (w - pad * 2) / (data.length - 1);
    function y(v) { return h - pad - ((v - min) / (max - min)) * (h - pad * 2); }
    var pts = data.map(function (v, i) { return [pad + i * step, y(v)]; });
    var line = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    var area = line + " L" + (pad + (data.length - 1) * step) + " " + (h - pad) + " L" + pad + " " + (h - pad) + " Z";
    var svg = '<path class="t-area" d="' + area + '"/><path class="t-line" d="' + line + '"/>';
    pts.forEach(function (p, i) {
      svg += '<circle class="t-dot" cx="' + p[0] + '" cy="' + p[1] + '" r="3.5"/>';
      svg += '<text class="t-label" x="' + p[0] + '" y="' + (h - 6) + '" text-anchor="middle">' + labels[i] + "</text>";
      svg += '<text class="t-label" x="' + p[0] + '" y="' + (p[1] - 8) + '" text-anchor="middle">' + data[i] + "</text>";
    });
    $("#trend-chart").innerHTML = svg;
    setRing($("#ring-val-big"), 85);
  }

  $("#accept-plan").addEventListener("click", function () {
    toast("下周计划已更新：新增 2 次轻食替换与 1 次快走");
  });

  /* ---------------- 我的 ---------------- */
  $$(".menu-item").forEach(function (m) {
    m.addEventListener("click", function () {
      toast("「" + m.dataset.menu + "」在正式版中开放");
    });
  });
  $("#rebuild-btn").addEventListener("click", function () {
    localStorage.removeItem(LS_PROFILE);
    state.profile = null;
    setAppLocked(true);
    obShow(0);
    showView("onboarding");
  });

  /* ---------------- 启动 ---------------- */
  loadState();
  renderGreeting();
  renderTasks();
  renderWeek();
  renderMonth();
  applyProfileEverywhere();

  if (state.profile) {
    enterApp();
  } else {
    setAppLocked(true);
    obShow(0);
  }

  /* 进入咨询页的欢迎语（仅一次） */
  $$(".tab").forEach(function (t) {
    t.addEventListener("click", function () {
      if (t.dataset.view === "chat" && !welcomed) {
        welcomed = true;
        setTimeout(function () {
          addMsg("ai", "你好呀，我是小禾。今天感觉怎么样？\n睡眠、饮食、运动、情绪上的问题都可以问我，我会结合你的健康画像来回答。");
        }, 350);
      }
    });
  });
})();

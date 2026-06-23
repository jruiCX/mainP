(function () {
  'use strict';

  const STORAGE_KEY = 'archive-lang';

  const STRINGS = {
    en: {
      'meta.title': 'Jason Rui | Portfolio Archive',
      'nav.status': 'Archive Online',
      'lang.switch': '中文',
      'hero.desc': 'Selected experiments in interaction, industrial design, and critical media studies.',
      'hero.scramble.1': 'Selected experiments in interaction, industrial design, and critical media studies.',
      'hero.scramble.2': 'Creative code, critical media, industrial design.',
      'hero.scramble.3': 'One archive. Many experiments.',
      'stat.collections': 'Collections',
      'stat.projects': 'Projects',
      'stat.mediums': 'Mediums',
      'stat.mediums.val': 'Code + Design',
      'section.coursework': 'Course Work',
      'section.industrial': 'Industrial Design',
      'card.iml300.period': 'Creative Coding',
      'card.iml300.desc': 'Interactive experiments, generative sketches, and multi-page web worlds built with p5.js.',
      'card.iml201.period': 'Critical Media',
      'card.iml201.desc': 'Surveillance culture, response-time hierarchies, and the persistence of the digital gaze.',
      'card.portfolio.period': 'Selected Works',
      'card.portfolio.desc': 'Product design, interaction systems, assistive technology, and spatial concepts in one PDF archive.',
      'card.link.open': 'Open collection',
      'card.link.pdf': 'View PDF',
      'about.heading': 'About',
      'about.name': 'Name',
      'about.name.val': '芮晨轩 Jason (Jason Rui)',
      'about.role': 'Role',
      'about.role.val': 'Product Designer / Frontend Engineer / Creative Developer',
      'about.tagline': 'Focus',
      'about.tagline.val': 'Design that helps people',
      'about.site': 'Work',
      'about.site.val': 'Everything lives on this site for now. More coming soon.',
      'about.stack': 'Stack',
      'about.stack.val': 'No fixed preference. Happy to learn anything.',
      'about.projects': 'Projects',
      'about.projects.val': 'Still growing. Not counting yet.',
      'about.contact': 'Contact',
      'footer.built': 'Built by Jason Rui',
    },
    zh: {
      'meta.title': 'Jason Rui | 作品集档案',
      'nav.status': '档案在线',
      'lang.switch': 'EN',
      'hero.desc': '涵盖交互、工业设计与批判媒体研究的精选实验。',
      'hero.scramble.1': '涵盖交互、工业设计与批判媒体研究的精选实验。',
      'hero.scramble.2': '创意编程、批判媒体、工业设计。',
      'hero.scramble.3': '一个档案库，许多实验。',
      'stat.collections': '合集',
      'stat.projects': '项目',
      'stat.mediums': '媒介',
      'stat.mediums.val': '代码 + 设计',
      'section.coursework': '课程作品',
      'section.industrial': '工业设计',
      'card.iml300.period': '创意编程',
      'card.iml300.desc': '基于 p5.js 的交互实验、生成草图与多页面 Web 世界。',
      'card.iml201.period': '批判媒体',
      'card.iml201.desc': '关于监控文化、回应时间层级与数字凝视的持续存在。',
      'card.portfolio.period': '精选作品',
      'card.portfolio.desc': '产品设计、交互系统、辅助技术与空间概念，收录于 PDF 档案。',
      'card.link.open': '打开合集',
      'card.link.pdf': '查看 PDF',
      'about.heading': '关于',
      'about.name': '姓名',
      'about.name.val': '芮晨轩 Jason (Jason Rui)',
      'about.role': '角色',
      'about.role.val': '产品设计师 / 前端工程师 / 创意开发者',
      'about.tagline': '定位',
      'about.tagline.val': '做能够帮到大家的设计',
      'about.site': '作品',
      'about.site.val': '现有内容都在本站，之后会慢慢补充。',
      'about.stack': '技术栈',
      'about.stack.val': '没有特定偏好，都能学。',
      'about.projects': '项目数量',
      'about.projects.val': '还在整理，暂不统计。',
      'about.contact': '联系',
      'footer.built': '芮晨轩 Jason Rui 制作',
    },
  };

  function detectLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'zh') return saved;
    const browser = (navigator.language || '').toLowerCase();
    return browser.startsWith('zh') ? 'zh' : 'en';
  }

  let currentLang = detectLang();

  function t(key) {
    return STRINGS[currentLang][key] || STRINGS.en[key] || key;
  }

  function getScramblePhrases() {
    return [
      t('hero.scramble.1'),
      t('hero.scramble.2'),
      t('hero.scramble.3'),
    ];
  }

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = t(key);
      if (value != null) el.textContent = value;
    });

    document.title = t('meta.title');

    const toggle = document.querySelector('[data-lang-toggle]');
    if (toggle) {
      toggle.textContent = t('lang.switch');
      toggle.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换到中文');
    }

    document.dispatchEvent(new CustomEvent('langchange', {
      detail: { lang, phrases: getScramblePhrases() },
    }));
  }

  function initLangToggle() {
    const btn = document.querySelector('[data-lang-toggle]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      applyLang(currentLang === 'en' ? 'zh' : 'en');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLangToggle();
    applyLang(currentLang);
  });

  window.ArchiveI18n = { t, getLang: () => currentLang, getScramblePhrases };
})();

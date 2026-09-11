// ===== Header scroll state + progress bar =====
const header = document.getElementById('siteHeader');
const progressBar = document.getElementById('progressBar');

function onScroll(){
  const scrollTop = window.scrollY;
  header.classList.toggle('scrolled', scrollTop > 40);

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  mainNav.classList.toggle('open');
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    mainNav.classList.remove('open');
  });
});

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// ===== Back to top =====
const toTop = document.getElementById('toTop');
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Language switch (TR/EN) =====
const LANG_KEY = 'db_lang';
const langButtons = document.querySelectorAll('.lang-switch button');
const textNodes = document.querySelectorAll('[data-en]');
const altNodes = document.querySelectorAll('[data-en-alt]');
const placeholderNodes = document.querySelectorAll('[data-en-placeholder]');
const titleEl = document.querySelector('title[data-en]');
const descEl = document.querySelector('meta[name="description"][data-en]');

textNodes.forEach(el => { if (el.dataset.tr === undefined) el.dataset.tr = el.innerHTML; });
altNodes.forEach(el => { if (el.dataset.trAlt === undefined) el.dataset.trAlt = el.getAttribute('alt') || ''; });
placeholderNodes.forEach(el => { if (el.dataset.trPlaceholder === undefined) el.dataset.trPlaceholder = el.getAttribute('placeholder') || ''; });
if (titleEl && titleEl.dataset.tr === undefined) titleEl.dataset.tr = titleEl.textContent;
if (descEl && descEl.dataset.tr === undefined) descEl.dataset.tr = descEl.getAttribute('content') || '';

function applyLang(lang){
  document.documentElement.lang = lang;
  textNodes.forEach(el => { el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.tr; });
  altNodes.forEach(el => { el.setAttribute('alt', lang === 'en' ? el.dataset.enAlt : el.dataset.trAlt); });
  placeholderNodes.forEach(el => { el.setAttribute('placeholder', lang === 'en' ? el.dataset.enPlaceholder : el.dataset.trPlaceholder); });
  if (titleEl) document.title = lang === 'en' ? titleEl.dataset.en : titleEl.dataset.tr;
  if (descEl) descEl.setAttribute('content', lang === 'en' ? descEl.dataset.en : descEl.dataset.tr);
  langButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
  localStorage.setItem(LANG_KEY, lang);
}

langButtons.forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

let savedLang = 'tr';
try { savedLang = localStorage.getItem(LANG_KEY) || 'tr'; } catch (e) {}
const urlLang = new URLSearchParams(window.location.search).get('lang');
if (urlLang === 'en' || urlLang === 'tr') savedLang = urlLang;
applyLang(savedLang);

// ===== Contact form (front-end only demo — no backend/mail service wired up yet) =====
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
if (contactForm && formNote) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formNote.textContent = document.documentElement.lang === 'en'
      ? 'Thank you — your message has been received. (Demo form: not yet connected to email.)'
      : 'Teşekkürler — mesajınız alındı. (Demo form: henüz e-postaya bağlı değil.)';
    contactForm.reset();
  });
}


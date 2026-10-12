/* Mejora progresiva: contenido, enlaces y desplegables funcionan sin JavaScript. */
const chatMessages = [
  'Ey 👋 Soy el gato de Habana. Te cuento quién está detrás del avatar.',
  'Cristian crea videojuegos con Unity y C#. Para el multijugador trabaja con Netcode for GameObjects.',
  'En la parte visual trabaja con Blender, Photoshop, Substance Painter, DaVinci Resolve y CapCut.',
  'Estudió Informática de Oficina y Sistemas Microinformáticos y Redes. Ahora cursa Animación 3D, Juegos y Entornos Interactivos en Florida Universitaria.',
  'Por su cuenta trastea con HTML, CSS, Lua, JavaScript y Python. Aún sigue aprendiendo.',
  'Tiene Unreal Engine en el radar y está esperando los servidores de GTA 6 Roleplay.',
  'Tiene 23 años y es de Valencia, España. Si quieres ver lo que hace, abre Proyectos en el menú de abajo.'
];
const chatList = document.querySelector('#avatar-chat');
const avatarFrames = [...document.querySelectorAll('.avatar-frame')];
let chatTimers = [];

function showAvatarFrame(index) {
  avatarFrames.forEach((frame, frameIndex) => frame.classList.toggle('is-visible', frameIndex === index));
}

function stopChat() {
  chatTimers.forEach(window.clearTimeout);
  chatTimers = [];
  chatList.replaceChildren();
}

function playChat() {
  stopChat();
  chatMessages.forEach((message, index) => {
    const timer = window.setTimeout(() => {
      const bubble = document.createElement('li');
      bubble.className = 'chat-bubble';
      bubble.textContent = message;
      chatList.append(bubble);
      chatTimers.push(window.setTimeout(() => {
        bubble.classList.add('is-fading');
        chatTimers.push(window.setTimeout(() => bubble.remove(), 1000));
      }, 20000));
      chatList.scrollTo({ top: chatList.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }, index === 0 ? 250 : index * 4400);
    chatTimers.push(timer);
  });
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopChat();
  }
});

const projectTiles = [...document.querySelectorAll('.project-tile')];
function openTile(tile) {
  projectTiles.forEach((item) => item.classList.toggle('is-open', item === tile));
}
projectTiles.forEach((tile) => {
  tile.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    openTile(tile);
    history.replaceState(null, '', `#${tile.id}`);
  });
  tile.addEventListener('keydown', (event) => {
    if (event.target !== tile || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    openTile(tile);
    history.replaceState(null, '', `#${tile.id}`);
  });
});
document.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('.project-tile')) projectTiles.forEach((tile) => tile.classList.remove('is-open'));
});
const deck = document.querySelector('main');
const screens = [...deck.querySelectorAll(':scope > section[id]')];
const deckLinks = [...document.querySelectorAll('.deck-nav a')];
const currentScreen = document.querySelector('#current-screen');
let activeScreen = 0;
let deckTransitionFrame = 0;

function moveDeck(left, animate) {
  window.cancelAnimationFrame(deckTransitionFrame);
  deckTransitionFrame = 0;
  const start = deck.scrollLeft;
  if (!animate || Math.abs(left - start) < 2) {
    deck.scrollTo({ left, top: 0, behavior: 'instant' });
    deck.classList.remove('is-transitioning');
    screens[1].classList.toggle('is-title-visible', activeScreen === 1);
    return;
  }
  deck.classList.add('is-transitioning');
  const started = performance.now();
  const duration = 1050;
  function step(now) {
    const progress = Math.min(1, (now - started) / duration);
    const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    deck.scrollTo({ left: start + (left - start) * eased, top: 0, behavior: 'instant' });
    if (progress < 1) deckTransitionFrame = window.requestAnimationFrame(step);
    else {
      deckTransitionFrame = 0;
      deck.classList.remove('is-transitioning');
      screens[1].classList.toggle('is-title-visible', activeScreen === 1);
    }
  }
  deckTransitionFrame = window.requestAnimationFrame(step);
}

function showScreen(index, updateHash = true) {
  const previousScreen = activeScreen;
  activeScreen = Math.max(0, Math.min(index, screens.length - 1));
  const screen = screens[activeScreen];
  window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
  screen.scrollLeft = 0;
  const motionAllowed = document.body.classList.contains('site-effects-on') || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  moveDeck(screen.offsetLeft, previousScreen !== activeScreen && motionAllowed);
  deckLinks.forEach((link, linkIndex) => {
    if (linkIndex === activeScreen) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  currentScreen.textContent = String(activeScreen + 1).padStart(2, '0');
  document.querySelector('#screen-prev').disabled = activeScreen === 0;
  document.querySelector('#screen-next').disabled = activeScreen === screens.length - 1;
  if (updateHash && window.location.hash !== `#${screen.id}`) history.replaceState(null, '', `#${screen.id}`);
  if (activeScreen !== 0) {
    stopChat();
    showAvatarFrame(0);
  }
}

deckLinks.forEach((link, index) => link.addEventListener('click', (event) => {
  event.preventDefault();
  showScreen(index);
}));
document.querySelector('#screen-prev').addEventListener('click', () => showScreen(activeScreen - 1));
document.querySelector('#screen-next').addEventListener('click', () => showScreen(activeScreen + 1));
document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('button, a, input, textarea, select, summary, dialog')) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); showScreen(activeScreen + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showScreen(activeScreen - 1); }
});

let lastWheelNavigation = 0;
deck.addEventListener('wheel', (event) => {
  if (Math.abs(event.deltaY) < Math.abs(event.deltaX) || event.target.closest('.chat-messages, details')) return;
  const screen = screens[activeScreen];
  const canMoveInside = event.deltaY > 0
    ? screen.scrollTop + screen.clientHeight < screen.scrollHeight - 2
    : screen.scrollTop > 2;
  if (canMoveInside) return;
  event.preventDefault();
  if (deckTransitionFrame || Date.now() - lastWheelNavigation < 1150) return;
  lastWheelNavigation = Date.now();
  showScreen(activeScreen + (event.deltaY > 0 ? 1 : -1));
}, { passive: false });

let scrollTimer;
deck.addEventListener('scroll', () => {
  window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(() => {
    if (deckTransitionFrame) return;
    const closest = screens.reduce((best, screen, index) => Math.abs(screen.offsetLeft - deck.scrollLeft) < Math.abs(screens[best].offsetLeft - deck.scrollLeft) ? index : best, 0);
    if (closest !== activeScreen) showScreen(closest, false);
  }, 120);
}, { passive: true });

function routeHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (hash === 'herramientas') { showScreen(1, false); return; }
  const target = document.getElementById(hash);
  if (!target) return;
  const screen = target.closest('main > section[id]');
  if (!screen) return;
  showScreen(screens.indexOf(screen), false);
  if (target.classList.contains('project-tile')) openTile(target);
  if (target !== screen) {
    target.scrollIntoView({ block: 'nearest' });
  }
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  if (link.closest('.deck-nav')) return;
  link.addEventListener('click', (event) => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target || target === deck) return;
    event.preventDefault();
    history.replaceState(null, '', link.hash);
    routeHash();
  });
});
window.addEventListener('hashchange', routeHash);
window.addEventListener('resize', () => showScreen(activeScreen, false));
window.addEventListener('pageshow', () => showScreen(activeScreen, false));
routeHash();

const contactChoices = [...document.querySelectorAll('[data-contact-choice]')];
const contactReply = document.querySelector('#contact-reply');
const contactResponse = document.querySelector('.contact-response');
const contactPrimary = document.querySelector('#contact-primary');
const contactPrimaryLabel = document.querySelector('#contact-primary-label');
const contactConsole = document.querySelector('.contact-console');
const contactExpressions = [...document.querySelectorAll('.contact-expressions img')];
function showContactExpression(choice) {
  const index = contactChoices.indexOf(choice);
  contactExpressions.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === index));
}
contactChoices.forEach((choice) => {
  choice.addEventListener('click', () => {
    showContactExpression(choice);
    if (choice.getAttribute('aria-pressed') === 'true') return;
    contactChoices.forEach((item) => item.setAttribute('aria-pressed', String(item === choice)));
    contactReply.textContent = choice.dataset.reply;
    contactPrimary.href = choice.dataset.contactUrl;
    contactPrimaryLabel.textContent = choice.dataset.contactLabel;
    contactConsole.classList.toggle('is-discord', choice.dataset.contactUrl.startsWith('https://discord.gg/'));
    if (!document.body.classList.contains('site-effects-on')) return;
    contactResponse.classList.remove('is-refreshing');
    void contactResponse.offsetWidth;
    contactResponse.classList.add('is-refreshing');
  });
});
contactResponse.addEventListener('animationend', () => contactResponse.classList.remove('is-refreshing'));

const dialog = document.querySelector('#video-dialog');
const container = document.querySelector('#video-container');
let videoTrigger;

// Los gameplays se abren en un diálogo; la demo reel está integrada en la página.
document.querySelectorAll('[data-video]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (typeof dialog.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    videoTrigger = link;
    document.querySelector('#video-title').textContent = link.dataset.title;
    document.querySelector('#video-original').href = link.href;
    const iframe = document.createElement('iframe');
    iframe.src = link.dataset.video;
    iframe.title = link.dataset.title;
    iframe.allow = 'fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    container.replaceChildren(iframe);
    dialog.showModal();
  });
});
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  container.replaceChildren();
  videoTrigger?.focus({ preventScroll: true });
});

// Aparición única al entrar en pantalla. El contenido nunca se oculta esperando a JS.
if ('IntersectionObserver' in window) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const surfaces = document.querySelectorAll('.about-reel, .skill-card, .project-tile, .contact-section');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      if (!motionPreference.matches) entry.target.classList.add('scroll-enter');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  surfaces.forEach((surface) => {
    surface.addEventListener('animationend', () => surface.classList.remove('scroll-enter'), { once: true });
    revealObserver.observe(surface);
  });
}

// Inicio: respuesta al cursor con un máximo de una actualización por fotograma.
const immersiveHero = document.querySelector('#inicio');
const immersiveStage = immersiveHero.querySelector('.avatar-stage');
const greetButton = document.querySelector('#avatar-greet');
const greeting = document.querySelector('#avatar-greeting');
const effectsDesktop = window.matchMedia('(min-width: 701px)');
function prepareDesktopImages() {
  if (!effectsDesktop.matches) return;
  deck.querySelectorAll('img[loading="lazy"]').forEach((image) => { image.loading = 'eager'; });
}
prepareDesktopImages();
effectsDesktop.addEventListener('change', prepareDesktopImages);
const effectsToggle = document.querySelector('#hero-effects-toggle');
let desktopEffectsRequested = true;
let heroEffectsEnabled = effectsDesktop.matches;
const heroPointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 701px)');
let heroFrame = 0;
let heroPointerPosition;
let greetingTimer;
function resetHeroLight() {
  window.cancelAnimationFrame(heroFrame);
  heroFrame = 0;
  heroPointerPosition = undefined;
  ['--light-x', '--light-y', '--avatar-x', '--avatar-y', '--avatar-rx', '--avatar-ry'].forEach((name) => immersiveHero.style.removeProperty(name));
}
immersiveHero.addEventListener('pointermove', (event) => {
  if (!heroEffectsEnabled || !heroPointer.matches || event.pointerType !== 'mouse') return;
  heroPointerPosition = { x: event.clientX, y: event.clientY };
  if (heroFrame) return;
  heroFrame = window.requestAnimationFrame(() => {
    heroFrame = 0;
    if (!heroPointerPosition || document.hidden) return;
    const rect = immersiveHero.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (heroPointerPosition.x - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (heroPointerPosition.y - rect.top) / rect.height));
    immersiveHero.style.setProperty('--light-x', `${x * 100}%`);
    immersiveHero.style.setProperty('--light-y', `${y * 100}%`);
    immersiveHero.style.setProperty('--avatar-x', `${(x - .5) * 10}px`);
    immersiveHero.style.setProperty('--avatar-y', `${(y - .5) * 6}px`);
    immersiveHero.style.setProperty('--avatar-rx', `${(.5 - y) * 4}deg`);
    immersiveHero.style.setProperty('--avatar-ry', `${(x - .5) * 6}deg`);
  });
}, { passive: true });
immersiveHero.addEventListener('pointerleave', resetHeroLight);
effectsDesktop.addEventListener('change', () => setHeroEffects(desktopEffectsRequested));
heroPointer.addEventListener('change', resetHeroLight);
document.addEventListener('visibilitychange', () => { if (document.hidden) resetHeroLight(); });
greetButton.hidden = false;
greetButton.addEventListener('click', () => {
  playChat();
  window.clearTimeout(greetingTimer);
  greeting.textContent = '¡Ey, hola! 👋';
  if (heroEffectsEnabled) {
    immersiveStage.classList.remove('is-greeting');
    void immersiveStage.offsetWidth;
    immersiveStage.classList.add('is-greeting');
  }
  greetingTimer = window.setTimeout(() => {
    greeting.textContent = '';
    immersiveStage.classList.remove('is-greeting');
  }, 2600);
});
if ('IntersectionObserver' in window) {
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      immersiveHero.classList.toggle('is-entering', entry.isIntersecting);
      if (!entry.isIntersecting) {
        resetHeroLight();
        window.clearTimeout(greetingTimer);
        greeting.textContent = '';
        immersiveStage.classList.remove('is-greeting');
      }
    });
  }, { threshold: .55 });
  heroObserver.observe(immersiveHero);
}
function setHeroEffects(enabled) {
  enabled = enabled && effectsDesktop.matches;
  heroEffectsEnabled = enabled;
  effectsToggle.hidden = !effectsDesktop.matches;
  resetHeroLight();
  immersiveHero.classList.toggle('hero-effects-on', enabled);
  document.body.classList.toggle('site-effects-on', enabled);
  screens.forEach((screen) => screen.classList.toggle('screen-effects-on', enabled));
  effectsToggle.setAttribute('aria-pressed', String(enabled));
  effectsToggle.textContent = enabled ? 'Desactivar efectos' : 'Activar efectos';
  if (enabled && activeScreen === 0) {
    immersiveHero.classList.remove('is-entering');
    window.requestAnimationFrame(() => {
      if (heroEffectsEnabled && activeScreen === 0) immersiveHero.classList.add('is-entering');
    });
  }
}
effectsToggle.addEventListener('click', () => {
  desktopEffectsRequested = !desktopEffectsRequested;
  setHeroEffects(desktopEffectsRequested);
});
setHeroEffects(desktopEffectsRequested);
// El texto conserva su tamaño: solo se animan las letras dentro de su espacio.
const aboutTitle = document.querySelector('#about-title');
aboutTitle.setAttribute('aria-label', 'Código, juego y carácter.');
aboutTitle.replaceChildren();
function titleWord(text, className, delay, stagger) {
  const word = document.createElement('span');
  word.className = className;
  word.setAttribute('aria-hidden', 'true');
  [...text].forEach((letter, index) => {
    const character = document.createElement('span');
    character.className = 'title-letter';
    character.textContent = letter;
    character.style.setProperty('--letter-delay', `${delay + index * stagger}s`);
    word.append(character);
  });
  return word;
}
const titleGame = document.createElement('span');
titleGame.className = 'title-game';
titleGame.textContent = 'juego';
titleGame.setAttribute('aria-hidden', 'true');
const titleAnd = document.createElement('span');
titleAnd.className = 'title-connector';
titleAnd.textContent = 'y';
titleAnd.setAttribute('aria-hidden', 'true');
aboutTitle.append(titleWord('Código,', 'title-code', .2, .095), ' ', titleGame, ' ', titleAnd, ' ', titleWord('carácter.', 'title-character', 2.15, .075));
const aboutTitleLine = document.createElement('span');
aboutTitleLine.className = 'title-line';
aboutTitleLine.append(...aboutTitle.childNodes);
aboutTitle.append(aboutTitleLine);
function fitAboutTitle() {
  if (!effectsDesktop.matches) {
    aboutTitle.style.removeProperty('font-size');
    return;
  }
  aboutTitle.style.fontSize = '100px';
  const textWidth = aboutTitleLine.offsetWidth;
  if (textWidth) aboutTitle.style.fontSize = `${100 * aboutTitle.clientWidth / textWidth}px`;
}
fitAboutTitle();
window.addEventListener('resize', fitAboutTitle);
if ('ResizeObserver' in window) {
  const titleSizeObserver = new ResizeObserver(fitAboutTitle);
  titleSizeObserver.observe(document.querySelector('.about-reel'));
}
if ('IntersectionObserver' in window) {
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio >= .89) entry.target.classList.add('is-title-visible');
      else if (!entry.isIntersecting) entry.target.classList.remove('is-title-visible');
    });
  }, { threshold: [0, .9] });
  titleObserver.observe(aboutTitle.closest('section'));
}
// Una única copia de Formación: en PC se despliega desde la identidad; en móvil sigue visible.
const profileIdentity = document.querySelector('.about-identity');
const profileEducation = document.querySelector('#profile-education');
const profileEducationHome = document.querySelector('.about-secondary');
const profileEducationToggle = document.querySelector('#education-toggle');
const profileDesktop = window.matchMedia('(min-width: 701px)');
let profileEducationPinned = false;
function showProfileEducation(open) {
  if (!profileDesktop.matches) return;
  if (open) {
    const available = document.querySelector('.deck-nav').getBoundingClientRect().top - profileIdentity.getBoundingClientRect().bottom - 12;
    profileIdentity.style.setProperty('--education-space', `${Math.max(100, available)}px`);
  }
  profileEducation.hidden = !open;
  profileIdentity.classList.toggle('is-education-open', open);
  profileEducationToggle.setAttribute('aria-expanded', String(open));
}
function placeProfileEducation() {
  profileEducationPinned = false;
  profileIdentity.classList.remove('is-education-open');
  profileIdentity.style.removeProperty('--education-space');
  profileEducationToggle.setAttribute('aria-expanded', 'false');
  profileEducationToggle.hidden = !profileDesktop.matches;
  profileIdentity.classList.toggle('profile-education-ready', profileDesktop.matches);
  profileEducationHome.classList.toggle('profile-education-ready', profileDesktop.matches);
  if (profileDesktop.matches) {
    profileIdentity.append(profileEducation);
    profileEducation.hidden = true;
  } else {
    profileEducationHome.append(profileEducation);
    profileEducation.hidden = false;
  }
}
profileEducationToggle.addEventListener('click', () => {
  profileEducationPinned = !profileEducationPinned;
  showProfileEducation(profileEducationPinned);
});
profileIdentity.addEventListener('focusout', (event) => {
  if (!profileIdentity.contains(event.relatedTarget)) {
    profileEducationPinned = false;
    showProfileEducation(false);
  }
});
document.addEventListener('pointerdown', (event) => {
  if (!profileIdentity.contains(event.target)) {
    profileEducationPinned = false;
    showProfileEducation(false);
  }
});
profileIdentity.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !profileEducation.hidden) {
    profileEducationPinned = false;
    showProfileEducation(false);
    profileEducationToggle.focus({ preventScroll: true });
    event.stopPropagation();
  }
});
profileDesktop.addEventListener('change', placeProfileEducation);
placeProfileEducation();

// Las pantallas comparten el mismo ajuste de efectos y solo reaccionan estando visibles.
let screenLightFrame = 0;
let screenLightPoint;
function resetScreenLights() {
  window.cancelAnimationFrame(screenLightFrame);
  screenLightFrame = 0;
  screenLightPoint = undefined;
  document.body.style.removeProperty('--site-light-x');
  document.body.style.removeProperty('--site-light-y');
}
document.addEventListener('pointermove', (event) => {
    if (!heroEffectsEnabled || !heroPointer.matches || event.pointerType !== 'mouse') return;
    screenLightPoint = { x: event.clientX, y: event.clientY };
    if (screenLightFrame) return;
    screenLightFrame = window.requestAnimationFrame(() => {
      screenLightFrame = 0;
      if (!screenLightPoint || !heroEffectsEnabled || document.hidden) return;
      const x = Math.max(0, Math.min(1, screenLightPoint.x / window.innerWidth));
      const y = Math.max(0, Math.min(1, screenLightPoint.y / window.innerHeight));
      document.body.style.setProperty('--site-light-x', `${x * 100}%`);
      document.body.style.setProperty('--site-light-y', `${y * 100}%`);
    });
}, { passive: true });
heroPointer.addEventListener('change', resetScreenLights);
effectsDesktop.addEventListener('change', resetScreenLights);
effectsToggle.addEventListener('click', resetScreenLights);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) resetScreenLights();
});
if ('IntersectionObserver' in window) {
  const screenEffectsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-effects-visible', entry.isIntersecting);
    });
  }, { threshold: .55 });
  screens.forEach((screen) => screenEffectsObserver.observe(screen));
}

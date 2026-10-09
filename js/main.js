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
let avatarReset;

function showAvatarFrame(index) {
  avatarFrames.forEach((frame, frameIndex) => frame.classList.toggle('is-visible', frameIndex === index));
}

function speakAvatar() {
  window.clearTimeout(avatarReset);
  showAvatarFrame(3);
  avatarReset = window.setTimeout(() => {
    showAvatarFrame(2);
    avatarReset = window.setTimeout(() => showAvatarFrame(0), 850);
  }, 140);
}

function playChat() {
  chatTimers.forEach(window.clearTimeout);
  chatTimers = [];
  chatList.replaceChildren();
  chatMessages.forEach((message, index) => {
    const timer = window.setTimeout(() => {
      const bubble = document.createElement('li');
      bubble.className = 'chat-bubble';
      bubble.textContent = message;
      chatList.append(bubble);
      chatList.scrollTo({ top: chatList.scrollHeight, behavior: 'smooth' });
      speakAvatar();
    }, index === 0 ? 250 : index * 4400);
    chatTimers.push(timer);
  });
  chatTimers.push(window.setTimeout(playChat, (chatMessages.length - 1) * 4400 + 7000));
}

document.querySelector('#chat-replay').addEventListener('click', playChat);
playChat();
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    chatTimers.forEach(window.clearTimeout);
    chatTimers = [];
  } else if (activeScreen === 0) playChat();
});

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.setInterval(() => {
    if (document.hidden || avatarFrames[2].classList.contains('is-visible')) return;
    showAvatarFrame(1);
    window.setTimeout(() => showAvatarFrame(0), 140);
  }, 4700);
}

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

function showScreen(index, updateHash = true) {
  const previousScreen = activeScreen;
  activeScreen = Math.max(0, Math.min(index, screens.length - 1));
  const screen = screens[activeScreen];
  deck.scrollTo({ left: screen.offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  deckLinks.forEach((link, linkIndex) => {
    if (linkIndex === activeScreen) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  currentScreen.textContent = String(activeScreen + 1).padStart(2, '0');
  document.querySelector('#screen-prev').disabled = activeScreen === 0;
  document.querySelector('#screen-next').disabled = activeScreen === screens.length - 1;
  if (updateHash && window.location.hash !== `#${screen.id}`) history.replaceState(null, '', `#${screen.id}`);
  if (activeScreen !== 0) {
    chatTimers.forEach(window.clearTimeout);
    chatTimers = [];
    showAvatarFrame(0);
  } else if (previousScreen !== 0) playChat();
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
  if (Date.now() - lastWheelNavigation < 700) return;
  lastWheelNavigation = Date.now();
  showScreen(activeScreen + (event.deltaY > 0 ? 1 : -1));
}, { passive: false });

let scrollTimer;
deck.addEventListener('scroll', () => {
  window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(() => {
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
routeHash();

const contactChoices = [...document.querySelectorAll('[data-contact-choice]')];
const contactReply = document.querySelector('#contact-reply');
const contactResponse = document.querySelector('.contact-response');
const contactPrimary = document.querySelector('#contact-primary');
const contactPrimaryLabel = document.querySelector('#contact-primary-label');
const contactConsole = document.querySelector('.contact-console');
contactChoices.forEach((choice) => {
  choice.addEventListener('click', () => {
    if (choice.getAttribute('aria-pressed') === 'true') return;
    contactChoices.forEach((item) => item.setAttribute('aria-pressed', String(item === choice)));
    contactReply.textContent = choice.dataset.reply;
    contactPrimary.href = choice.dataset.contactUrl;
    contactPrimaryLabel.textContent = choice.dataset.contactLabel;
    contactConsole.classList.toggle('is-discord', choice.dataset.contactUrl.startsWith('https://discord.gg/'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

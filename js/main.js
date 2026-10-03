/* Mejora progresiva: contenido, enlaces y desplegables funcionan sin JavaScript. */
const filters = document.querySelector('.filters');
const cards = [...document.querySelectorAll('[data-category]')];
const count = document.querySelector('#project-count');

function filterProjects(category) {
  let visible = 0;
  cards.forEach((card) => {
    card.hidden = category !== 'all' && card.dataset.category !== category;
    if (!card.hidden) visible += 1;
  });
  filters.querySelectorAll('button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  });
  count.textContent = `${visible} ${visible === 1 ? 'proyecto' : 'proyectos'}`;
}

filters.hidden = false;
filters.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-filter]');
  if (button) filterProjects(button.dataset.filter);
});

// Los enlaces directos muestran su proyecto aunque se haya aplicado un filtro.
function revealLinkedProject() {
  const card = cards.find((item) => `#${item.id}` === window.location.hash);
  if (card?.hidden) {
    filterProjects('all');
    card.scrollIntoView({ block: 'start' });
  }
}
window.addEventListener('hashchange', revealLinkedProject);
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    const card = cards.find((item) => `#${item.id}` === link.getAttribute('href'));
    if (card?.hidden) filterProjects('all');
  });
});
revealLinkedProject();

const dialog = document.querySelector('#video-dialog');
const container = document.querySelector('#video-container');
let videoTrigger;

// El reproductor externo solo se carga cuando se solicita un vídeo.
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

// Señala la sección visible sin modificar el historial de navegación.
if ('IntersectionObserver' in window) {
  const navigation = [...document.querySelectorAll('nav a')];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navigation.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-20% 0px -55% 0px', threshold: 0 });
  document.querySelectorAll('main > section[id]').forEach((section) => observer.observe(section));
}

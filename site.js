const modal = document.querySelector('#viewer');
let returnFocus;
function openViewer(title, content) {
  returnFocus = document.activeElement;
  modal.querySelector('[data-title]').textContent = title;
  modal.querySelector('.dialog-inner').replaceChildren(content);
  modal.showModal();
}
document.querySelectorAll('[data-play]').forEach(button => button.addEventListener('click', () => {
  const video = document.createElement('video');
  video.src = button.dataset.play;
  video.controls = true;
  video.playsInline = true;
  openViewer(button.dataset.title || '作品样片', video);
  video.play().catch(() => {});
}));
document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
  const img = document.createElement('img');
  img.src = button.dataset.image;
  img.alt = button.querySelector('img').alt;
  openViewer(img.alt, img);
}));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    dialog.querySelectorAll('video').forEach(video => video.pause());
    if (dialog === modal) { modal.querySelector('.dialog-inner').replaceChildren(); returnFocus?.focus(); }
  });
});
document.querySelectorAll('video').forEach(video => {
  video.addEventListener('play', () => document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); }));
  video.addEventListener('timeupdate', () => {
    if (video.dataset.preview && video.currentTime >= 3) { video.pause(); delete video.dataset.preview; }
  });
  video.addEventListener('ended', () => delete video.dataset.preview);
});
document.querySelectorAll('[data-excerpt]').forEach(button => button.addEventListener('click', () => {
  const video = document.getElementById(button.dataset.excerpt);
  video.currentTime = 0;
  video.dataset.preview = 'true';
  video.play().catch(() => {});
}));
const directory = document.querySelector('#directory');
document.querySelectorAll('[data-directory]').forEach(button => button.addEventListener('click', () => {
  returnFocus = button;
  directory.showModal();
}));
let selected = 0;
const cards = [...document.querySelectorAll('.gallery-card')];
const compactGallery = matchMedia('(max-width: 600px)');
function rotateGallery(delta) {
  selected = (selected + delta + cards.length) % cards.length;
  cards.forEach((card, index) => {
    let offset = (index - selected + cards.length) % cards.length;
    if (offset > cards.length / 2) offset -= cards.length;
    const active = offset === 0;
    card.style.transform = compactGallery.matches
      ? 'translateX(-50%)'
      : `translateX(calc(-50% + ${offset * 67}%)) translateZ(${-Math.abs(offset) * 260}px) rotateY(${-offset * 24}deg)`;
    card.style.opacity = active ? '1' : compactGallery.matches ? '0' : Math.abs(offset) > 1 ? '0' : '.3';
    card.style.zIndex = active ? '2' : '0';
    card.style.pointerEvents = active ? 'auto' : 'none';
    card.tabIndex = active ? 0 : -1;
    card.setAttribute('aria-hidden', String(!active));
  });
  document.querySelector('[data-gallery-status]').textContent = `${selected + 1} / ${cards.length}`;
}
document.querySelector('[data-prev]')?.addEventListener('click', () => rotateGallery(-1));
document.querySelector('[data-next]')?.addEventListener('click', () => rotateGallery(1));
directory?.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') rotateGallery(-1); if (e.key === 'ArrowRight') rotateGallery(1); });
if (cards.length) rotateGallery(0);
compactGallery.addEventListener('change', () => rotateGallery(0));

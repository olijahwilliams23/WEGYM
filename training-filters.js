// WEGYM: body-area filtering on individual training-style pages.
document.addEventListener('DOMContentLoaded', () => {
  const buttons = [...document.querySelectorAll('.body-filter-btn')];
  const cards = [...document.querySelectorAll('.training-exercise[data-parts]')];
  const empty = document.querySelector('.exercise-no-results');
  if (!buttons.length || !cards.length) return;
  buttons.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    buttons.forEach(b => {
      const active = b === button;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    let count = 0;
    cards.forEach(card => {
      const parts = (card.dataset.parts || '').split(',').map(x => x.trim());
      const show = selected === 'All' || parts.includes(selected);
      card.hidden = !show;
      if (show) count++;
    });
    if (empty) empty.hidden = count > 0;
  }));
});

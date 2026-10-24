// Move the login buttons into the sign-in card. Both stay inside #login-form, so submitting is unchanged.
const buttons = document.querySelector('#login-form .buttons-set');
const card = document.querySelector('#login-form .registered-users');
if (buttons && card) card.append(buttons);

// The site has no viewport tag, so phones lay it out at ~980px and zoom out; the mobile CSS never applies.
if (!document.querySelector('meta[name="viewport"]')) {
  const viewport = document.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = 'width=device-width, initial-scale=1';
  document.head.append(viewport);
}

// Wrong-password message is a plain <div>; mark it as an alert so screen readers announce it.
document.querySelector('.registered-users > div[style*="990000"]')?.setAttribute('role', 'alert');

// Help sub-navigation (loadContent) swaps #content for a "Loading..." placeholder first, which flashes an
// empty card. Put the previous section back instead; observer callbacks run before paint, so it never shows.
const content = document.getElementById('content');
if (content) {
  let last = content.innerHTML;
  new MutationObserver(() => {
    if (content.querySelector(':scope > center img[src*="loadbar"]')) content.innerHTML = last;
    else { addHelpPlaceholders(); last = content.innerHTML; }
  }).observe(content, { childList: true });
}

// Help forms have no placeholder text; add hints (on load and whenever a help section is swapped in).
function addHelpPlaceholders() {
  const hints = { nokp: 'Masukkan eSILA-ID', katalaluan: 'Masukkan kata laluan', nokpLama: 'Masukkan No KP Lama' };
  document.querySelectorAll('#frmBantuan input[name]').forEach((input) => {
    if (hints[input.name] && !input.placeholder) input.placeholder = hints[input.name];
  });
}
addHelpPlaceholders();

// Help side menu: the site never marks the open section. Mark it from ?page= (default Soalan Lazim) and on click.
const navLinks = [...document.querySelectorAll('ul#nav a')];
if (navLinks.length) {
  const setActive = (active) => navLinks.forEach((a) => (a === active ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  const page = new URLSearchParams(location.search).get('page') || 'soalanLazim';
  setActive(navLinks.find((a) => a.getAttribute('href').includes(`bantuan_${page}.php`)));
  navLinks.forEach((a) => a.addEventListener('click', () => setActive(a)));
}

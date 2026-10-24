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
    else { addHelpPlaceholders(); markGrades(); last = content.innerHTML; }
  }).observe(content, { childList: true });
}

// Home page: the profile photo iframe is absolutely positioned over the content; put it at the top of the sidebar.
const photo = document.getElementById('gambar');
const sidebar = document.getElementById('left-col');
if (photo && sidebar) sidebar.prepend(photo);

// Help forms have no placeholder text; add hints (on load and whenever a help section is swapped in).
function addHelpPlaceholders() {
  const hints = { nokp: 'Masukkan eSILA-ID', katalaluan: 'Masukkan kata laluan', nokpLama: 'Masukkan No KP Lama' };
  document.querySelectorAll('#frmBantuan input[name]').forEach((input) => {
    if (hints[input.name] && !input.placeholder) input.placeholder = hints[input.name];
  });
}
addHelpPlaceholders();

// Exam results (pengajian.php): column 3 holds a plain grade such as 3.5300. Wrap grades in a pill:
// 3.00 and up green, below red. Only tables whose column-3 header is "Keputusan": payment pages (bayaran.php,
// kutipan.php) also have numbers in column 3 (amounts), which must not look like grades.
function markGrades() {
  const gradeTables = [...document.querySelectorAll('#content table.data-table')]
    .filter((t) => /Keputusan/i.test(t.querySelector('tr > th:nth-child(3)')?.textContent || ''));
  gradeTables.flatMap((t) => [...t.querySelectorAll('td:nth-child(3):not(:has(.ext-grade))')]).forEach((td) => {
    const text = td.textContent.trim();
    if (!/^\d+(\.\d+)?$/.test(text)) return;
    const pill = document.createElement('span');
    pill.className = `ext-grade ${parseFloat(text) >= 3 ? 'good' : 'low'}`;
    pill.append(...td.childNodes);
    td.append(pill);
  });
}
markGrades();

// Side menu (help and home pages): the site never marks the open section. Use ?page= when it names a link
// (e.g. bantuan.php?page=emelPengaktifan), otherwise the first link, which is what the page shows by default.
const navLinks = [...document.querySelectorAll('ul#nav a')];
if (navLinks.length) {
  const setActive = (active) => navLinks.forEach((a) => (a === active ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  const page = new URLSearchParams(location.search).get('page');
  setActive((page && navLinks.find((a) => a.getAttribute('href')?.includes(`_${page}.php`))) || navLinks[0]);
  navLinks.forEach((a) => a.addEventListener('click', () => setActive(a)));
}

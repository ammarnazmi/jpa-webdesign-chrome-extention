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

// Some kutipan.php tabs are slow on JPA's server (Semak Bil Tuntutan Bulanan ~8s) and its loadContent shows no
// placeholder, so the click seemed to do nothing. For the tabs listed here, mark the card as loading (aria-busy,
// styled in CSS) until the section arrives. The 30s fallback clears it if the request fails.
const SLOW_TABS = ['kutipan_semakBilTuntutan.php', 'kutipan_tukarModelPBUTamatPengajian.php'];
const content = document.getElementById('content');
let busyTimer;
function setBusy(on) {
  if (!content) return;
  clearTimeout(busyTimer);
  if (!on) { content.removeAttribute('aria-busy'); return; }
  content.setAttribute('aria-busy', 'true');
  busyTimer = setTimeout(() => setBusy(false), 30000);
}
// Some pages' loadContent (help pages) first swap in a "Loading..." placeholder, which flashes an empty card: put the
// previous section back instead (observer callbacks run before paint, so it never shows).
if (content) {
  let last = content.innerHTML;
  let restoring = false;
  new MutationObserver(() => {
    if (restoring) { restoring = false; return; } // our own restore below; the real section has not arrived yet
    if (content.querySelector(':scope > center img[src*="loadbar"]')) {
      restoring = true;
      content.innerHTML = last;
    } else {
      setBusy(false);
      addHelpPlaceholders(); markStatuses(); markGrades();
      last = content.innerHTML;
    }
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

// Column 3 of a table with a header row holds a status or a grade. Each helper only touches tables whose
// column-3 header names it, because payment pages (bayaran.php, kutipan.php) have amounts in column 3.
const tablesWithColumn3 = (header) => [...document.querySelectorAll('#content table.data-table')]
  .filter((t) => header.test(t.querySelector('tr > th:nth-child(3)')?.textContent || ''));
const wrapIn = (td, className) => {
  const pill = document.createElement('span');
  pill.className = className;
  pill.append(...td.childNodes);
  td.append(pill);
};

// Activity table (home > Aktiviti MySELF, header "Status"): wrap the status in a pill coloured by its words;
// "TIDAK LULUS" is checked before "LULUS". Unknown statuses get the neutral pill.
function markStatuses() {
  tablesWithColumn3(/Status/i).flatMap((t) => [...t.querySelectorAll('td:nth-child(3):not(:has(.ext-status))')]).forEach((td) => {
    const text = td.textContent.toUpperCase();
    const kind = /TIDAK|TOLAK|GAGAL|BATAL/.test(text) ? 'fail' : /SAH|LULUS|SELESAI/.test(text) ? 'ok' : /PROSES|SEMAK|TANGGUH|BARU/.test(text) ? 'pending' : '';
    wrapIn(td, `ext-status ${kind}`);
  });
}
markStatuses();

// Exam results (pengajian.php, header "Keputusan"): a plain grade such as 3.5300 becomes a pill,
// 3.00 and up green, below red.
function markGrades() {
  tablesWithColumn3(/Keputusan/i).flatMap((t) => [...t.querySelectorAll('td:nth-child(3):not(:has(.ext-grade))')]).forEach((td) => {
    const text = td.textContent.trim();
    if (/^\d+(\.\d+)?$/.test(text)) wrapIn(td, `ext-grade ${parseFloat(text) >= 3 ? 'good' : 'low'}`);
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
  navLinks.forEach((a) => a.addEventListener('click', () => {
    setActive(a);
    if (SLOW_TABS.some((file) => a.getAttribute('href')?.includes(file))) setBusy(true);
  }));
}

// Runs in the page's own JS world (not the extension's isolated one), so it can change the site's globals.

// Wrap window.alert before the site's scripts run. Only the re-registration notice shown on every visit
// is dropped; validation alerts still appear.
const nativeAlert = window.alert;
window.alert = function (message) {
  if (String(message).startsWith('Pelajar/Pegawai tajaan yang pernah mendaftar')) return;
  return nativeAlert.call(window, message);
};

// Modalbox plays ~0.8s of fade/slide animations and only then requests the pop-up content (the server
// answers in ~0.1s). Turning transitions off shows the content right away. Must be set before the first
// pop-up: Modalbox copies its options on first use and restores that copy after every close.
document.addEventListener('DOMContentLoaded', () => {
  if (window.Modalbox) window.Modalbox.options.transitions = false;
});

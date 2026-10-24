// Runs in the page's own JS world before its scripts, so it can wrap window.alert.
// Only the re-registration notice shown on every visit is dropped; validation alerts still appear.
const nativeAlert = window.alert;
window.alert = function (message) {
  if (String(message).startsWith('Pelajar/Pegawai tajaan yang pernah mendaftar')) return;
  return nativeAlert.call(window, message);
};

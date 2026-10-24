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

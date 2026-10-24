// Move the login buttons into the sign-in card. Both stay inside #login-form, so submitting is unchanged.
const buttons = document.querySelector('#login-form .buttons-set');
const card = document.querySelector('#login-form .registered-users');
if (buttons && card) card.append(buttons);

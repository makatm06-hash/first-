export function initEnquiryForm(form) {
 const button = form.querySelector('[type="submit"]');
 const status = form.querySelector('#form-status');
 const idleLabel = button.innerHTML;
 let sending = false;
 function report(state, message) {
  status.dataset.state = state;
  status.textContent = message;
 }
 form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || !form.reportValidity()) return;
  const data = new FormData(form);
  const controls = [...form.elements].filter(control => !control.disabled);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  sending = true;
  controls.forEach(control => { control.disabled = true; });
  form.setAttribute('aria-busy', 'true');
  button.textContent = 'Sending…';
  report('pending', 'Sending your enquiry…');
  try {
   const response = await fetch(form.action, {
    method: 'POST', body: data,
    headers: { Accept: 'application/json' },
    signal: controller.signal,
   });
   if (!response.ok) {
    if (response.status === 429) report('error', 'Too many attempts. Please wait a moment, then try again.');
    else report('error', 'We couldn’t send your enquiry. Your details are still here — please try again.');
    return;
   }
   form.reset();
   report('success', 'Thanks — your enquiry has been sent.');
  } catch {
   report('error', 'We couldn’t confirm your enquiry was sent. Your details are still here — please try again.');
  } finally {
   clearTimeout(timeout);
   sending = false;
   controls.forEach(control => { control.disabled = false; });
   form.removeAttribute('aria-busy');
   button.innerHTML = idleLabel;
  }
 });
}

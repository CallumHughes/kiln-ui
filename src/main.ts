import { mount } from 'svelte';
import App from './App.svelte'

// ESPHome's build_index_html emits no viewport meta at all — it is absent from
// the v2/v3 index page regardless of css_url/js_url (only the v1 server sets
// one), and still absent on upstream dev. Without it iOS lays the page out at
// 980px and scales it down. Prepended before mount so it applies to the first
// layout.
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'width=device-width, initial-scale=1.0';
document.head.prepend(meta);

const app = mount(App, {
  target: document.getElementsByTagName('esp-app').item(0),
});

export default app

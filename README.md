# 🔥 kiln-ui

UI for the ESPHome based Kiln controller:
https://github.com/kiln-controller/esphome-kiln-api

See the above repository for the getting started with this.

## Local development

To connect to your device during local development, create a `.env.local` file in the project root with:

```
KILN_DEVICE_URL=http://<device-ip>/
VITE_KILN_URL=/api/
```

`KILN_DEVICE_URL` sets the Vite proxy target so requests are forwarded server-side (avoiding CORS). `VITE_KILN_URL` tells the app to route through the proxy instead of hitting the device directly.

Then start the dev server:

```
npm run dev
```

## How the build is served

The device serves the page itself and loads the UI from the `css_url` / `js_url`
in its ESPHome config, so `dist/index.css` and `dist/index.js` go on whatever
host those URLs point at:

```yaml
web_server:
  port: 80
  css_url: http://<asset-host>/index.css
  js_url: http://<asset-host>/index.js
```

Because the device serves the page, the API is same-origin and the build uses a
relative base. That comes from `.env.production` (`VITE_KILN_URL=/`), which is
committed on purpose: `.env.local` applies to production builds too and ranks
above `.env`, so without the pin a checkout set up for local development would
quietly produce a bundle calling the dev proxy base. Editing `.env.local` does
not change what `npm run build` emits.

If you ever do need a cross-origin build — serving the UI from somewhere other
than the device — pass the base on the command line, which beats both files:

```
VITE_KILN_URL=http://<device-ip>/ npm run build
```

That needs the device to answer CORS preflights, so it wants ESPHome >= 2026.7
on the device (earlier builds can't return a 204).

## Demo

[https://kiln-controller.s3.eu-central-1.amazonaws.com/index.html](https://kiln-controller.s3.eu-central-1.amazonaws.com/index.html)

The status page will not work in the demo since there is no kiln connected. I might make a more functional demo at some point.

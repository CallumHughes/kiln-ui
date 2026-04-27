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

## Demo

[https://kiln-controller.s3.eu-central-1.amazonaws.com/index.html](https://kiln-controller.s3.eu-central-1.amazonaws.com/index.html)

The status page will not work in the demo since there is no kiln connected. I might make a more functional demo at some point.

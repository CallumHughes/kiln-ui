/**
 * Stop a touch tap being delivered as hover.
 *
 * On a tap, WebKit synthesises a `mouseover` before the `click`. sveltestrap's
 * `Tooltip` opens on `mouseover` and mounts its bubble into `<body>`, and when
 * a tap's synthetic `mouseover` makes new content appear, iOS treats the tap as
 * a hover and never dispatches the `click` at all. `pointer-events: none` on
 * the bubble cannot help with that one: there is no click to re-target.
 *
 * So the emulated `mouseover` is swallowed in the capture phase at `document`,
 * before it reaches the listener sveltestrap bound on the button. Nothing
 * appears, the tap stays a tap, and the `click` is dispatched normally.
 *
 * `pointerover` tells the two apart: real pointer events carry a `pointerType`,
 * and the compatibility mouse events WebKit synthesises from a touch do not
 * generate any, so the last `pointerover` still describes the input that is
 * driving the current `mouseover`. This reads it per event rather than snapshotting
 * `matchMedia('(hover: hover)')` at load, so a device with both inputs — an iPad
 * with a trackpad attached — gets tooltips from the trackpad and none from a
 * finger, with no reload.
 *
 * Capture at `document` rather than a listener on each button because at the
 * target itself listeners run in registration order whatever their phase, and
 * `Tooltip` binds its own in `onMount`; an ancestor's capture listener is the
 * only one guaranteed to run first.
 *
 * `Tooltip` is otherwise untouched — it still renders the bubble and Popper still
 * places it and its arrow.
 */
export function suppress_emulated_hover(): void {
  let hover_is_real = true;

  document.addEventListener(
    'pointerover',
    (event: PointerEvent) => {
      hover_is_real = event.pointerType === 'mouse';
    },
    true
  );

  document.addEventListener(
    'mouseover',
    (event: MouseEvent) => {
      if (!hover_is_real) {
        event.stopPropagation();
      }
    },
    true
  );
}

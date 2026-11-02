import type { Attachment } from 'svelte/attachments';

// A tooltip is a hover affordance, so it should only ever appear for input that
// can actually hover. Touch browsers emulate hover with the first tap, and a
// tooltip bound to a button swallows that tap: the button then needs tapping
// twice, which reads as "the buttons don't work".
//
// This attachment decides per event, from `pointerType`, rather than from a
// matchMedia snapshot taken at import time — so a device that gains or loses a
// mouse (an iPad with a trackpad attached) behaves correctly without a reload,
// and a touch tap on a device that also has a mouse still raises no tooltip.
// It owns the bubble's DOM, so there is no component state to keep in sync and
// no `id`/`target` pair to match up:
//
//   <Button {@attach tooltip('Create')}>…</Button>
//
// Icon-only buttons also get the text as `aria-label` when they have no
// accessible name of their own, so the label reaches screen readers — on touch
// devices too, where the bubble never shows.

const GAP = 6; // room for the arrow, which sits above the bubble

export function tooltip(text: string): Attachment<HTMLElement> {
  return (node) => {
    let bubble: HTMLElement | null = null;
    const labelled = !node.getAttribute('aria-label') && !node.getAttribute('title');
    if (labelled) node.setAttribute('aria-label', text);

    function show() {
      if (bubble || !text) return;

      bubble = document.createElement('div');
      // Bootstrap's own tooltip markup, minus Popper: `bs-tooltip-auto` plus
      // the placement attribute is what its arrow styles key off.
      bubble.className = 'tooltip bs-tooltip-auto show';
      bubble.setAttribute('data-popper-placement', 'bottom');
      bubble.setAttribute('aria-hidden', 'true');
      bubble.style.position = 'fixed';
      bubble.style.left = '0';
      bubble.style.top = '0';
      // Never let the bubble sit under the pointer and eat a click.
      bubble.style.pointerEvents = 'none';

      const arrow = document.createElement('div');
      arrow.className = 'tooltip-arrow';
      arrow.style.transform = 'translateX(-50%)';

      const inner = document.createElement('div');
      inner.className = 'tooltip-inner';
      inner.textContent = text;

      bubble.append(arrow, inner);
      document.body.appendChild(bubble);

      const target = node.getBoundingClientRect();
      const self = bubble.getBoundingClientRect();
      // Centred under the target, pulled back inside the viewport. GAP is the
      // floor, so a bubble wider than the viewport starts at the left edge
      // rather than off-screen.
      const left = Math.max(
        GAP,
        Math.min(
          target.left + target.width / 2 - self.width / 2,
          window.innerWidth - self.width - GAP,
        ),
      );
      bubble.style.left = `${Math.round(left)}px`;
      bubble.style.top = `${Math.round(target.bottom + GAP)}px`;
      // Keep the arrow on the target even when the bubble has been pulled back
      // from an edge, without letting it slide off the bubble's own corners.
      const centre = target.left + target.width / 2 - left;
      arrow.style.left = `${Math.round(Math.max(GAP * 2, Math.min(centre, self.width - GAP * 2)))}px`;
    }

    function hide() {
      bubble?.remove();
      bubble = null;
    }

    // Hover, for a pointer that can hover.
    function onPointerEnter(e: PointerEvent) {
      if (e.pointerType === 'mouse') show();
    }

    // Keyboard focus, so the label is reachable without a pointer at all. A
    // click focuses the button too, hence `:focus-visible` rather than `:focus`.
    function onFocus() {
      if (node.matches(':focus-visible')) show();
    }

    node.addEventListener('pointerenter', onPointerEnter);
    node.addEventListener('pointerleave', hide);
    node.addEventListener('pointerdown', hide);
    node.addEventListener('focus', onFocus);
    node.addEventListener('blur', hide);
    // The bubble is positioned once, so anything that moves the target invalidates it.
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);

    return () => {
      hide();
      if (labelled && node.getAttribute('aria-label') === text) {
        node.removeAttribute('aria-label');
      }
      node.removeEventListener('pointerenter', onPointerEnter);
      node.removeEventListener('pointerleave', hide);
      node.removeEventListener('pointerdown', hide);
      node.removeEventListener('focus', onFocus);
      node.removeEventListener('blur', hide);
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  };
}

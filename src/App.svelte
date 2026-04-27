<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Router from 'svelte-spa-router';
  import {link} from 'svelte-spa-router';
  import active from 'svelte-spa-router/active'
  import routes from './routes';
  import { stored_logs, current_state, connection_status, type RecordConfig} from "./lib/stores";

  import {
    Icon,
    Styles,
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
  } from '@sveltestrap/sveltestrap';

  let isOpen: boolean = $state(false);
  function handleUpdate(event: CustomEvent<boolean>) {
    isOpen = event.detail;
  }


  // start gathering logs
  // stock esphome
  const esphome = new EventSource(import.meta.env.VITE_KILN_URL + "events");
  // https://esphome.io/web-api/#event-source-api
  esphome.addEventListener("log", (e: MessageEvent) => {
    // https://github.com/esphome/esphome-webserver/blob/main/v2/esp-log.ts#L21
    const d: String = e.data;
    let parts = d.slice(10, d.length - 4).split(":");
    let tag = parts.slice(0, 2).join(":");
    let detail = d.slice(12 + tag.length, d.length - 4);
    const types: Record<string, string> = {
      "[1;31m": "e",
      "[0;33m": "w",
      "[0;32m": "i",
      "[0;35m": "c",
      "[0;36m": "d",
      "[0;37m": "v",
    };
    const record = {
      type: types[d.slice(0, 7)],
      level: d.slice(7, 10),
      tag: tag,
      detail: detail,
      when: new Date().toTimeString().split(" ")[0],
    } as RecordConfig;

    $stored_logs.unshift(record);
    $stored_logs = $stored_logs;
  });

  let pollTimeout: ReturnType<typeof setTimeout>;
  let etag: string | null = null;

  async function poll() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const headers: Record<string, string> = etag ? { 'If-None-Match': etag } : {};
      const res = await fetch(import.meta.env.VITE_KILN_URL + "kiln/state", {
        headers,
        cache: 'no-store',
        signal: controller.signal,
      });
      if (res.status === 304 && Object.keys($current_state).length === 0) {
        // stale ETag with no data yet — reset and let next poll fetch fresh
        etag = null;
      } else if (res.status === 304) {
        connection_status.set({ status: 'connected', lastStatusCode: res.status });
      } else if (res.ok) {
        connection_status.set({ status: 'connected', lastStatusCode: res.status });
        etag = res.headers.get('ETag');
        $current_state = await res.json();
      } else {
        connection_status.set({ status: 'error', lastStatusCode: res.status });
      }
    } catch (e) {
      connection_status.set({ status: 'error', lastStatusCode: null });
    } finally {
      clearTimeout(timeout);
    }
    pollTimeout = setTimeout(poll, 5000);
  }

  onMount(() => poll());

  onDestroy(() => clearTimeout(pollTimeout));
</script>

<!-- margin to prevent page content getting hidden the footer-->
<main style="height: 100%; margin-bottom: 40px;">
  <Styles theme='auto' />
  {#snippet navItems()}
    <NavItem>
      <a href="/" class="nav-link" use:link use:active={'/'}>Schedules</a>
    </NavItem>
    <NavItem>
      <a href="/status" class="nav-link" use:link use:active={'/status'}>Status</a>
    </NavItem>
    <NavItem>
      <NavLink href="https://github.com/kiln-controller"><Icon name="github" /></NavLink>
    </NavItem>
  {/snippet}

  <Navbar class="mb-4" color="primary-subtle">
    <NavbarBrand href="/">Kiln Controller</NavbarBrand>

    <!-- desktop: always visible -->
    <Nav class="ms-auto d-none d-md-flex flex-row gap-2" navbar>
      {@render navItems()}
    </Nav>

    <!-- mobile: toggler + collapse -->
    <NavbarToggler class="d-md-none" on:click={() => (isOpen = !isOpen)} />
    <Collapse {isOpen} navbar on:update={handleUpdate} class="d-md-none">
      <Nav navbar>
        {@render navItems()}
      </Nav>
    </Collapse>
  </Navbar>

  <Router {routes}/>
</main>
<footer class="fixed-bottom bg-body-tertiary">
  <div class="text-center p-2">
    <a href="https://github.com/kiln-controller"><Icon name="github" /></a>
    kilny.nl
  </div>
</footer>
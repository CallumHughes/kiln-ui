<script lang="ts">
  import { run } from 'svelte/legacy';

  // https://github.com/leeoniya/uPlot/issues/556#issuecomment-1271653615
  import 'uplot/dist/uPlot.min.css';
	import uPlot, { type AlignedData } from 'uplot';

  interface ProgressMarker {
    x: number;
    y: number;
    active: boolean;
  }

  interface Props {
    data: AlignedData | undefined;
    progressMarker?: ProgressMarker;
  }

  let { data, progressMarker }: Props = $props();

  let targ: HTMLElement = $state();

	run(() => {
		if (targ) {
      targ.innerHTML = "";  // force the graph to be redrawn and not append and keep the old one
      new uPlot({
        width: targ.offsetWidth,
        height: 400,
        series: [
            {label: "Hours", value: "{YYYY}-{MM}-{DD} {HH}:{mm}:{ss}"},
            {label: "°C", stroke: window.getComputedStyle(targ).getPropertyValue("--bs-primary")}
        ],
        // 24h time format: https://github.com/leeoniya/uPlot/issues/83#issuecomment-570392055
        axes: [
          {
            stroke: window.getComputedStyle(targ).getPropertyValue("color"),
            values: [
              [3600 * 24 * 365,    "{YYYY}",               7,   "{YYYY}"                 ],
              [3600 * 24 * 28,     "{MMM}",                7,   "{MMM}\n{YYYY}"          ],
              [3600 * 24,          "{M}/{D}",              7,   "{M}/{D}\n{YYYY}"        ],
              [3600,               "{HH}:{mm}",            4,   "{HH}\n{M}/{D}"          ],
              [60,                 "{HH}:{mm}",            4,   "{HH}:{mm}\n{M}/{D}"     ],
              [1,                  "{HH}:{mm}:{ss}",       4,   "{HH}:{mm}:{ss}\n{M}/{D}"],
            ],
          },
          {
            stroke: window.getComputedStyle(targ).getPropertyValue("color")
          }
        ],
        hooks: {
          draw: [
            (u: uPlot) => {
              if (!progressMarker) return;
              const ctx = u.ctx;
              // valToPos with true returns absolute canvas pixel coordinates
              const cx = u.valToPos(progressMarker.x, 'x', true);
              const cy = u.valToPos(progressMarker.y, 'y', true);
              const r = 6 * devicePixelRatio;

              ctx.save();
              ctx.beginPath();
              ctx.arc(cx, cy, r, 0, Math.PI * 2);
              ctx.fillStyle = progressMarker.active ? 'limegreen' : 'grey';
              ctx.fill();
              if (progressMarker.active) {
                ctx.shadowColor = 'limegreen';
                ctx.shadowBlur = 12 * devicePixelRatio;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.restore();
            }
          ]
        }
      }, data, targ);
    }
  });
  // window.addEventListener("resize", e => {
  //   plot.setSize({
  //     width: targ.offsetWidth - 100,
  //     height: targ.offsetHeight - 200,
  //   });
  // });

</script>

<div bind:this={targ}></div>

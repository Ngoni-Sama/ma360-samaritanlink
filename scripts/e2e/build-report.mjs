// Convert stage recordings to MP4, stitch a full-run video, and build the HTML report.
// Usage: node build-report.mjs <outDir> <ffmpeg.exe> <reportHtmlPath>
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const [OUT, FFMPEG, REPORT] = process.argv.slice(2);
const data = JSON.parse(readFileSync(join(OUT, 'results.json'), 'utf8'));
const VID = join(OUT, 'video');

// ---- videos ----
const mp4s = [];
for (const s of data.results) {
  if (!s.video) continue;
  const src = join(VID, s.video), dst = src.replace(/\.webm$/, '.mp4');
  const r = spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', src, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst]);
  if (r.status === 0) { s.mp4 = dst.split(/[\\/]/).pop(); mp4s.push(dst); } else console.log('ffmpeg failed for', s.video, String(r.stderr).slice(0, 300));
}
if (mp4s.length) {
  const inputs = mp4s.flatMap((f) => ['-i', f]);
  const chains = mp4s.map((_, i) => `[${i}:v]scale=1280:800:force_original_aspect_ratio=decrease,pad=1280:800:(ow-iw)/2:(oh-ih)/2:color=0x0d141a,setsar=1,fps=25[v${i}]`).join(';');
  const filter = `${chains};${mp4s.map((_, i) => `[v${i}]`).join('')}concat=n=${mp4s.length}:v=1:a=0[out]`;
  const full = join(VID, 'samaritanlink-full-test.mp4');
  const r = spawnSync(FFMPEG, ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filter, '-map', '[out]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', full]);
  console.log(r.status === 0 ? `full video: ${full}` : 'full video failed: ' + String(r.stderr).slice(0, 300));
}

// ---- report ----
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const img = (f) => { const p = join(OUT, 'shots', f); return existsSync(p) ? `data:image/jpeg;base64,${readFileSync(p).toString('base64')}` : ''; };
const steps = data.results.flatMap((s) => s.steps.map((t) => ({ ...t, stage: s })));
const failed = steps.filter((t) => !t.ok);
const passed = steps.length - failed.length;
const mins = Math.round((new Date(data.finishedAt) - new Date(data.startedAt)) / 60000);
const day = new Date(data.startedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const stepCard = (t) => `
  <li class="step ${t.ok ? '' : 'is-fail'}">
    <div class="step-head">
      <span class="chip ${t.ok ? 'pass' : 'fail'}">${t.ok ? 'Pass' : 'Fail'}</span>
      <span class="num">${t.stage.num}.${t.n}</span>
      <span class="title">${esc(t.title)}</span>
    </div>
    <div class="meta"><code>${esc(t.url)}</code><span>${(t.ms / 1000).toFixed(1)} s</span></div>
    ${t.ok ? '' : `<p class="err">${esc(t.error)}</p>`}
    <details><summary>Screenshot</summary><img loading="lazy" src="${img(t.shot)}" alt="Screenshot after step ${t.stage.num}.${t.n}: ${esc(t.title)}"></details>
  </li>`;

const html = `<title>SamaritanLink Test Run</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Layout: one reading column; a stage summary table up top, failures next, then each stage's steps with screenshots. */
:root {
  --bg: #f2f6f5; --surface: #ffffff; --ink: #0d141a; --ink-2: #3f4d53; --muted: #63747b; --line: #d3e0de;
  --brand: #2c7a7b; --pass: #1f7a4d; --pass-bg: #e6f4ec; --fail: #b4232f; --fail-bg: #fdecee;
  --font: "Open Sans", "Segoe UI", system-ui, sans-serif; --mono: "JetBrains Mono", ui-monospace, Consolas, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #0b1514; --surface: #12201f; --ink: #e6efee; --ink-2: #b9c8c7; --muted: #8b9d9c; --line: #26393a;
  --brand: #63bcbc; --pass: #84c895; --pass-bg: #163222; --fail: #f19aa2; --fail-bg: #3a1a1e; color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #0b1514; --surface: #12201f; --ink: #e6efee; --ink-2: #b9c8c7; --muted: #8b9d9c; --line: #26393a;
  --brand: #63bcbc; --pass: #84c895; --pass-bg: #163222; --fail: #f19aa2; --fail-bg: #3a1a1e; color-scheme: dark; }
* { box-sizing: border-box; }
body { background: var(--bg); color: var(--ink); font: 15px/1.55 var(--font); padding-inline: 16px; padding-block: 32px 64px; }
.wrap { max-width: 980px; margin-inline: auto; display: grid; gap: 36px; }
.eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--brand); }
h1 { font-size: clamp(28px, 4.5vw, 40px); font-weight: 800; line-height: 1.1; margin: 6px 0 0; letter-spacing: -.02em; text-wrap: balance; }
h2 { font-size: 20px; font-weight: 800; margin: 0 0 12px; }
.lede { color: var(--ink-2); max-width: 64ch; margin: 10px 0 0; }
.lede a { color: var(--brand); }
.score { display: flex; flex-wrap: wrap; gap: 8px 22px; margin-top: 14px; font-size: 15px; color: var(--ink-2); }
.score b { font-variant-numeric: tabular-nums; color: var(--ink); font-size: 22px; font-weight: 800; margin-right: 4px; }
.score .bad b { color: var(--fail); }
.tablewrap { overflow-x: auto; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); font-weight: 700; }
tr:last-child td { border-bottom: 0; }
td.n { font-variant-numeric: tabular-nums; white-space: nowrap; }
td a { color: var(--brand); font-weight: 600; }
code { font-family: var(--mono); font-size: 12.5px; color: var(--ink-2); overflow-wrap: anywhere; }
.chip { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; border-radius: 6px; padding: 2px 7px; }
.chip.pass { color: var(--pass); background: var(--pass-bg); }
.chip.fail { color: var(--fail); background: var(--fail-bg); }
.stage { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 18px 18px 8px; scroll-margin-top: 16px; }
.stage-top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 6px 16px; margin-bottom: 8px; }
.stage-top h2 { margin: 0; }
.stage-top .sub { color: var(--muted); font-size: 13px; }
ol.steps { list-style: none; margin: 0; padding: 0; }
.step { border-top: 1px solid var(--line); padding: 10px 0; }
.step-head { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; }
.num { font-family: var(--mono); font-size: 12px; color: var(--muted); }
.title { font-weight: 600; min-width: 0; }
.meta { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 2px; font-size: 12.5px; color: var(--muted); }
.err { margin: 6px 0 0; color: var(--fail); font-size: 14px; }
.is-fail { background: color-mix(in srgb, var(--fail-bg) 55%, transparent); margin-inline: -18px; padding-inline: 18px; }
details { margin-top: 6px; }
summary { cursor: pointer; color: var(--brand); font-size: 13px; font-weight: 600; width: fit-content; }
summary:focus-visible, a:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
details img { display: block; margin-top: 8px; width: 100%; height: auto; border: 1px solid var(--line); border-radius: 10px; }
.findings { display: grid; gap: 12px; }
.finding { background: var(--surface); border: 1px solid var(--line); border-left: 4px solid var(--fail); border-radius: 12px; padding: 14px 16px; }
.finding p { margin: 4px 0 0; color: var(--ink-2); }
.note { color: var(--muted); font-size: 13px; }
</style>
<div class="wrap">
  <header>
    <div class="eyebrow">MA360 SamaritanLink · end-to-end test</div>
    <h1>Full site test, ${esc(day)}</h1>
    <p class="lede">Every stage was run in a real browser against the live site, <a href="${esc(data.base)}" target="_blank" rel="noopener">${esc(data.base.replace('https://', ''))}</a>, with a video recording per stage and a screenshot after each step. Demo data was reset before and after the run.</p>
    <div class="score">
      <span><b>${passed}</b>steps passed</span>
      <span class="${failed.length ? 'bad' : ''}"><b>${failed.length}</b>failed</span>
      <span><b>${data.results.length}</b>stages</span>
      <span><b>${mins}</b>minutes</span>
    </div>
  </header>

  <section>
    <h2>Stages</h2>
    <div class="tablewrap"><table>
      <thead><tr><th>#</th><th>Stage</th><th>Steps</th><th>Recording</th><th>Console errors</th></tr></thead>
      <tbody>${data.results.map((s) => { const ok = s.steps.filter((t) => t.ok).length; return `
        <tr><td class="n">${s.num}</td><td><a href="#stage-${s.num}">${esc(s.name)}</a>${s.viewport.startsWith('390') ? ' <span class="note">(phone)</span>' : ''}</td>
        <td class="n"><span class="chip ${ok === s.steps.length ? 'pass' : 'fail'}">${ok}/${s.steps.length}</span></td>
        <td><code>${esc(s.mp4 || s.video || 'none')}</code></td><td class="n">${s.consoleErrors.length}</td></tr>`; }).join('')}
      </tbody></table></div>
    <p class="note">Recordings are in <code>Documents\\SamaritanLink-E2E\\2026-10-07\\video</code>, plus one stitched file, <code>samaritanlink-full-test.mp4</code>.</p>
  </section>

  ${failed.length ? `<section><h2>What failed</h2><div class="findings">${failed.map((t) => `
    <div class="finding"><span class="chip fail">Fail</span> <span class="num">${t.stage.num}.${t.n}</span> <strong>${esc(t.stage.name)}: ${esc(t.title)}</strong>
    <p>${esc(t.error)}</p><details><summary>Screenshot</summary><img loading="lazy" src="${img(t.shot)}" alt="Screenshot of failed step ${t.stage.num}.${t.n}"></details></div>`).join('')}</div></section>` : ''}

  ${data.results.map((s) => `
  <section class="stage" id="stage-${s.num}">
    <div class="stage-top"><h2>${s.num}. ${esc(s.name)}</h2><span class="sub">${s.viewport} · ${esc(s.mp4 || s.video || '')}${s.consoleErrors.length ? ` · ${s.consoleErrors.length} console error(s)` : ''}</span></div>
    ${s.fatal ? `<p class="err">Stage stopped early: ${esc(s.fatal)}</p>` : ''}
    <ol class="steps">${s.steps.map((t) => stepCard({ ...t, stage: s })).join('')}</ol>
    ${s.consoleErrors.length ? `<details><summary>Console errors</summary><ul>${s.consoleErrors.map((e) => `<li><code>${esc(e)}</code></li>`).join('')}</ul></details>` : ''}
  </section>`).join('')}
</div>`;

writeFileSync(REPORT, html);
console.log(`report: ${REPORT} (${(html.length / 1048576).toFixed(1)} MB), ${passed}/${steps.length} passed`);

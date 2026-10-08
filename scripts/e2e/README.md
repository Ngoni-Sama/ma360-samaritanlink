# Recorded end-to-end test

Runs every role's journey against the live site in a real browser, records a video per stage and
takes a screenshot after each step. The results are published on the `/review` page.

1. Run the test (needs patchright with a downloaded Chromium; `run.mjs` finds it in the
   DSCodeGPT VS Code extension's `standalone/` folder):
   `node scripts/e2e/run.mjs <outDir>`
2. Convert the recordings to MP4 and build a standalone HTML report (needs ffmpeg):
   `node scripts/e2e/build-report.mjs <outDir> <ffmpeg.exe> <report.html>`
3. Copy the run into the app for `/review` (needs ffprobe):
   `node scripts/e2e/import-run.mjs <outDir> . <YYYY-MM-DD> <ffprobe.exe>`

Step 3 writes `public/review/<id>/` (screenshots and videos) and `src/data/review/<id>.json`, and
regenerates `src/data/review/index.ts`. The newest run shows at `/review`, and earlier runs at
`/review/<id>`. The test resets the demo workflows before and after it runs.

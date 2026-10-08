// SamaritanLink full end-to-end test against the live site.
// One recorded browser context per stage; every step gets an on-screen caption,
// an assertion and a screenshot. Usage: node run.mjs <outDir>
import { createRequire } from 'node:module';
import { readdirSync, existsSync, mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';

function resolveChromium() {
  const base = join(homedir(), '.vscode/extensions');
  const dirs = readdirSync(base).filter((d) => d.startsWith('danielsanmedium.dscodegpt-'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  for (const d of dirs.reverse()) {
    try { const m = createRequire(join(base, d, 'standalone') + '/')('patchright'); const c = m?.chromium ?? m?.default?.chromium; if (c) return c; } catch {}
  }
  throw new Error('patchright not found');
}

const BASE = 'https://ma360-samaritanlink.vercel.app';
const OUT = process.argv[2];
const SHOTS = join(OUT, 'shots'), VID = join(OUT, 'video');
mkdirSync(SHOTS, { recursive: true }); mkdirSync(VID, { recursive: true });

const chromium = resolveChromium();
const browser = await chromium.launch({ headless: true, channel: 'chromium', slowMo: 120 });
const results = [];
const DESKTOP = { width: 1280, height: 800 }, PHONE = { width: 390, height: 844 };
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function caption(page, top, line, bottomOffset) {
  await page.evaluate(([a, b, off]) => {
    let el = document.getElementById('__e2e_caption');
    if (!el) {
      el = document.createElement('div'); el.id = '__e2e_caption';
      Object.assign(el.style, { position: 'fixed', right: '12px', zIndex: '2147483647', background: 'rgba(13,20,26,.9)', color: '#fff',
        font: '600 13px/1.4 system-ui,sans-serif', padding: '8px 14px', borderRadius: '10px', pointerEvents: 'none', maxWidth: '360px', boxShadow: '0 6px 20px rgba(0,0,0,.3)' });
      document.documentElement.appendChild(el);
    }
    el.style.bottom = off + 'px';
    el.innerHTML = `<div style="opacity:.7;font-weight:500">${a}</div><div>${b}</div>`;
  }, [top, line, bottomOffset]).catch(() => {});
}

async function runStage(num, name, viewport, fn) {
  const ctx = await browser.newContext({ viewport, recordVideo: { dir: VID, size: viewport } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  const stage = { num, name, viewport: `${viewport.width}x${viewport.height}`, steps: [], consoleErrors: [] };
  page.on('console', (m) => { if (m.type() === 'error') stage.consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => stage.consoleErrors.push('pageerror: ' + String(e.message).slice(0, 200)));
  const off = viewport.width < 600 ? 92 : 14;
  const head = `Stage ${num} of 11 · ${name}`;
  let n = 0;
  const step = async (title, body) => {
    n++;
    const rec = { n, title, ok: true }; const t0 = Date.now();
    try {
      await caption(page, head, `Step ${n}: ${title}`, off);
      await body(page);
      await page.waitForTimeout(400);
      await caption(page, head, `Step ${n}: ${title} — PASS`, off);
    } catch (e) {
      rec.ok = false; rec.error = String(e?.message || e).split('\n')[0].slice(0, 300);
      await caption(page, head, `Step ${n}: ${title} — FAIL`, off);
    }
    rec.ms = Date.now() - t0;
    rec.url = page.url().replace(BASE, '') || '/';
    rec.shot = `s${String(num).padStart(2, '0')}-${String(n).padStart(2, '0')}.jpg`;
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(SHOTS, rec.shot), type: 'jpeg', quality: 62 }).catch(() => {});
    stage.steps.push(rec);
    console.log(`[S${num}.${n}] ${rec.ok ? 'PASS' : 'FAIL'} ${title}${rec.ok ? '' : '  ::  ' + rec.error}`);
  };
  try { await fn(page, step); } catch (e) { stage.fatal = String(e?.message || e).slice(0, 300); console.log(`[S${num}] FATAL ${stage.fatal}`); }
  const video = page.video();
  await ctx.close();
  if (video) {
    const src = await video.path();
    const dest = join(VID, `stage-${String(num).padStart(2, '0')}-${slug(name)}.webm`);
    try { renameSync(src, dest); stage.video = basename(dest); } catch { stage.video = basename(src); }
  }
  results.push(stage);
  writeFileSync(join(OUT, 'results.json'), JSON.stringify({ base: BASE, startedAt, results }, null, 2));
}

// ---------- helpers ----------
const see = (page, text, opts = {}) => page.getByText(text, opts).first().waitFor({ state: 'visible' });
async function login(page, email, password = 'demo1234') {
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', password);
  await page.click('button[type=submit]');
}
const row = (page, text) => page.locator('div.rounded-2xl.px-4.py-3').filter({ hasText: text }).first();
function must(cond, msg) { if (!cond) throw new Error(msg); }

// ---------- setup: known starting state ----------
const startedAt = new Date().toISOString();
{
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await login(p, 'admin@demo.samaritanlink'); await p.waitForURL('**/app');
  const r = await p.request.post(BASE + '/api/workflow', { data: { action: 'reset', args: {} } });
  console.log(`[setup] demo data reset -> ${r.status()}`);
  await ctx.close();
}

// ---------- STAGE 1: public website ----------
await runStage(1, 'Public website', DESKTOP, async (page, step) => {
  await step('Open the landing page', async (p) => {
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await see(p, 'Care That Crosses the Distance');
  });
  await step('Health Access Equity layer is on the landing page', async (p) => {
    await p.locator('#equity').scrollIntoViewIfNeeded(); await see(p, 'Health Access Equity Layer');
  });
  await step('Nav: How It Works opens its own page', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.getByRole('link', { name: 'How It Works' }).first().click();
    await p.waitForURL('**/how-it-works'); await see(p, 'How SamaritanLink keeps care connected');
  });
  await step('Breadcrumb Home returns to the landing page', async (p) => {
    await p.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Home' }).click();
    await p.waitForURL(BASE + '/'); await see(p, 'Care That Crosses the Distance');
  });
  await step('For Organisations page', async (p) => {
    await p.getByRole('link', { name: 'For Organisations' }).first().click();
    await p.waitForURL('**/for-organisations'); await see(p, 'Sustainable by design');
  });
  await step('Equity page', async (p) => { await p.goto(BASE + '/equity'); await see(p, 'Factors that shape access'); });
  await step('Use Cases page', async (p) => { await p.goto(BASE + '/use-cases'); await see(p, 'Maternal & postnatal continuity'); });
  await step('Access SamaritanLink goes to sign in', async (p) => {
    await p.goto(BASE + '/'); await p.getByRole('link', { name: /Access SamaritanLink/ }).first().click();
    await p.waitForURL('**/login'); await see(p, 'Demo accounts');
  });
});

// ---------- STAGE 2: sign-in and access control ----------
await runStage(2, 'Sign-in and access control', DESKTOP, async (page, step) => {
  await step('App pages redirect to sign-in when logged out', async (p) => {
    await p.goto(BASE + '/app/patients'); await p.waitForURL('**/login'); await see(p, 'Access SamaritanLink');
  });
  await step('Wrong password is rejected with a clear message', async (p) => {
    await login(p, 'clinician@demo.samaritanlink', 'wrong-password'); await see(p, 'Invalid email or password.');
  });
  await step('Clinician signs in', async (p) => {
    await login(p, 'clinician@demo.samaritanlink'); await p.waitForURL('**/app'); await see(p, 'Clinical dashboard');
  });
  await step('Non-admin cannot open the M&E dashboard', async (p) => {
    await p.goto(BASE + '/app/intelligence'); await p.waitForURL((u) => !u.pathname.includes('intelligence'));
    must(!p.url().includes('intelligence'), 'clinician reached /app/intelligence');
  });
  await step('Log out returns to sign-in (no error page)', async (p) => {
    await p.locator('form[action="/api/auth/logout"] button').first().click();
    await p.waitForURL('**/login'); await see(p, 'Access SamaritanLink');
    must(!(await p.content()).includes('405'), 'HTTP 405 shown');
  });
});

// ---------- STAGE 3: clinician ----------
await runStage(3, 'Clinician', DESKTOP, async (page, step) => {
  await step('Sign in as Dr. Farai Chikowore', async (p) => { await login(p, 'clinician@demo.samaritanlink'); await p.waitForURL('**/app'); await see(p, 'Clinical dashboard'); });
  await step('Dashboard lists care journeys needing follow-up', async (p) => {
    await see(p, 'Care journeys needing follow-up'); await see(p, 'is stuck before');
  });
  await step('Search patient by SamaritanLink ID', async (p) => {
    await p.goto(BASE + '/app/patients'); await p.fill('input[type=search]', 'SL-P-2026-000001');
    await p.getByRole('link', { name: /Tendai Moyo/ }).click(); await p.waitForURL('**/app/patients/SL-P-2026-000001');
  });
  await step('Profile shows care journey, referrals and barriers', async (p) => {
    await see(p, 'My Care Journey'); await see(p, 'Referrals & access barriers'); await see(p, 'Clinical actions');
  });
  await step('Prescribe: send to Unity Pharmacy', async (p) => {
    await p.fill('#rx-items', 'E2E Amlodipine 5 mg x 30');
    await p.getByRole('button', { name: /Send prescription to pharmacy/ }).click();
    await see(p, 'Prescription sent to Unity Pharmacy.');
  });
  await step('Request lab test', async (p) => {
    await p.getByRole('tab', { name: 'Request lab' }).click();
    await p.fill('#lab-tests', 'E2E Fasting glucose');
    await p.getByRole('button', { name: /Send request to laboratory/ }).click();
    await see(p, 'Test request sent to MA360 Partner Laboratory.');
  });
  await step('Schedule review for another patient (Chipo Dube)', async (p) => {
    await p.goto(BASE + '/app/patients/SL-P-2026-000002'); await see(p, 'Clinical actions');
    await p.getByRole('tab', { name: 'Schedule review' }).click();
    await p.fill('#review-when', '2026-11-20T10:30');
    await p.getByRole('button', { name: /Schedule review & remind patient/ }).click();
    await see(p, 'Review scheduled. The patient gets an SMS reminder.');
  });
  await step('Create a referral', async (p) => {
    await p.goto(BASE + '/app/referrals'); await see(p, 'Where care journeys stand');
    await p.selectOption('#ref-patient', 'SL-P-2026-000002');
    await p.selectOption('#ref-to', 'Parirenyatwa Group');
    await p.fill('#ref-reason', 'E2E postnatal check');
    await p.getByRole('button', { name: /Create referral/ }).click();
    await row(p, 'E2E postnatal check').waitFor();
  });
  await step('Confirm the referral was received', async (p) => {
    const r = row(p, 'E2E postnatal check');
    await r.getByRole('button', { name: /Confirm: referral received/ }).click();
    await r.getByRole('button', { name: /Confirm: appointment attended/ }).waitFor();
  });
});

// ---------- STAGE 4: pharmacy ----------
await runStage(4, 'Pharmacy', DESKTOP, async (page, step) => {
  await step('Sign in as Unity Pharmacy', async (p) => { await login(p, 'pharmacy@demo.samaritanlink'); await p.waitForURL('**/app'); await see(p, 'Incoming prescriptions'); });
  await step('New prescription from the clinician is in the queue', async (p) => { await row(p, 'E2E Amlodipine 5 mg x 30').waitFor(); await see(p, 'New prescription for Tendai Moyo'); });
  await step('Start preparing', async (p) => { const r = row(p, 'E2E Amlodipine'); await r.getByRole('button', { name: 'Start preparing' }).click(); await r.getByText('Being prepared').waitFor(); });
  await step('Mark ready (patient is notified)', async (p) => { const r = row(p, 'E2E Amlodipine'); await r.getByRole('button', { name: 'Mark ready' }).click(); await r.getByText('Ready for collection').waitFor(); });
  await step('Mark collected', async (p) => { const r = row(p, 'E2E Amlodipine'); await r.getByRole('button', { name: 'Mark collected' }).click(); await r.getByText('Collected', { exact: true }).waitFor(); });
});

// ---------- STAGE 5: laboratory ----------
await runStage(5, 'Laboratory', DESKTOP, async (page, step) => {
  await step('Sign in as MA360 Partner Laboratory', async (p) => { await login(p, 'lab@demo.samaritanlink'); await p.waitForURL('**/app'); await see(p, 'Incoming test requests'); });
  await step('Clinician request is in the queue', async (p) => { await row(p, 'E2E Fasting glucose').waitFor(); });
  await step('Collect sample', async (p) => { const r = row(p, 'E2E Fasting glucose'); await r.getByRole('button', { name: 'Collect sample' }).click(); await r.getByRole('button', { name: 'Start processing' }).waitFor(); });
  await step('Start processing', async (p) => { const r = row(p, 'E2E Fasting glucose'); await r.getByRole('button', { name: 'Start processing' }).click(); await r.getByLabel('Result summary').waitFor(); });
  await step('Enter result and mark results ready', async (p) => {
    const r = row(p, 'E2E Fasting glucose'); await r.getByLabel('Result summary').fill('6.1 mmol/L, borderline');
    await r.getByRole('button', { name: 'Results ready' }).click(); await r.getByText('Result: 6.1 mmol/L, borderline').waitFor();
  });
  await step('Send to doctor (doctor and patient notified)', async (p) => { const r = row(p, 'E2E Fasting glucose'); await r.getByRole('button', { name: 'Send to doctor' }).click(); await r.getByText('Sent to doctor').waitFor(); });
});

// ---------- STAGE 6: community health worker ----------
await runStage(6, 'Community health worker', DESKTOP, async (page, step) => {
  await step('Sign in as Rutendo Nyathi (CHW)', async (p) => { await login(p, 'chw@demo.samaritanlink'); await p.waitForURL('**/app'); await see(p, 'Community dashboard'); });
  await step('Follow-up list shows the two stalled journeys', async (p) => { await see(p, 'Care journeys needing follow-up'); await see(p, 'Blessing Ncube'); await see(p, 'Chipo Dube'); });
  await step('Home visit: record outcome and complete', async (p) => {
    const r = row(p, 'Blood-pressure check'); await r.getByRole('button', { name: 'Record outcome' }).click();
    await r.getByLabel('Observations').fill('BP 138/88, taking medication as prescribed');
    await r.getByRole('button', { name: 'Mark completed' }).click(); await r.getByText('completed', { exact: true }).waitFor();
  });
  await step('Referrals: live stage summary', async (p) => { await p.goto(BASE + '/app/referrals'); await see(p, 'Where care journeys stand'); await see(p, 'Why journeys are stuck now'); });
  await step('Filter: Needs attention', async (p) => {
    await p.getByRole('button', { name: /Needs attention/ }).click(); await row(p, 'Uncontrolled hypertension').waitFor();
    await p.getByRole('button', { name: /^All \(/ }).click();
  });
  await step('Tendai: mark Not progressing (Cost)', async (p) => {
    const r = row(p, 'Specialist hypertension review');
    await r.getByRole('button', { name: /Not progressing/ }).click();
    await r.getByRole('radio', { name: /Cost/ }).click();
    await r.getByLabel(/What happened/).fill('Cannot afford the specialist consultation fee');
    await r.getByRole('button', { name: 'Save barrier' }).click();
    await r.getByText(/Stuck before treatment started/).waitFor();
  });
  await step('Moving on is blocked until a response is recorded', async (p) => {
    const r = row(p, 'Specialist hypertension review');
    must(await r.getByRole('button', { name: /Confirm:/ }).count() === 0, 'Confirm button visible while stalled');
  });
  await step('Record response and resume', async (p) => {
    const r = row(p, 'Specialist hypertension review');
    await r.getByRole('button', { name: /Record response & resume/ }).click();
    await r.getByText(/Cost barrier addressed/).waitFor();
  });
  await step('Confirm next stage: treatment started', async (p) => {
    const r = row(p, 'Specialist hypertension review');
    await r.getByRole('button', { name: /Confirm: treatment started/ }).click();
    await r.getByRole('button', { name: /Confirm: follow-up completed/ }).waitFor();
  });
  await step('Blessing: respond to transport barrier and confirm attendance', async (p) => {
    const r = row(p, 'Uncontrolled hypertension');
    await r.getByRole('button', { name: /Record response & resume/ }).click();
    await r.getByRole('button', { name: /Confirm: appointment attended/ }).click();
    await r.getByRole('button', { name: /Confirm: treatment started/ }).waitFor();
  });
});

// ---------- STAGE 7: patient ----------
await runStage(7, 'Patient', DESKTOP, async (page, step) => {
  await step('Sign in as Tendai Moyo', async (p) => { await login(p, 'patient@demo.samaritanlink'); await p.waitForURL('**/app'); await see(p, 'Welcome to SamaritanLink, Tendai'); });
  await step('Medicine shows as collected', async (p) => { await row(p, 'E2E Amlodipine').waitFor({ state: 'attached' }).catch(() => {}); await see(p, 'E2E Amlodipine 5 mg x 30'); await see(p, 'Collected'); });
  await step('Lab test shows as with your doctor', async (p) => { await see(p, 'E2E Fasting glucose'); await see(p, 'With your doctor'); });
  await step('Notifications include the pharmacy and lab updates', async (p) => { await see(p, /ready for collection/); await see(p, /laboratory results have been sent/i); });
  await step('Patient sees only their own messages (privacy)', async (p) => {
    const card = p.locator('div.glass-panel').filter({ has: p.getByRole('heading', { name: 'My notifications' }) }).first();
    const text = await card.innerText();
    must(!/Chipo|Blessing/.test(text), 'another patient\'s message is visible in this patient\'s notifications');
  });
  await step('My Care Journey shows referrals and support arranged', async (p) => {
    await p.goto(BASE + '/app/journey'); await see(p, 'My referrals'); await see(p, 'Specialist hypertension review'); await see(p, /Support arranged/);
  });
  await step('Health Navigator answers a question', async (p) => {
    await p.goto(BASE + '/app/navigator');
    const ta = p.getByLabel('Describe your health need'); await ta.fill('I have been having headaches and dizziness.'); await ta.press('Enter');
    await p.waitForFunction(() => document.querySelectorAll('div[class*="max-w-[80%]"]').length >= 3, null, { timeout: 60000 });
  });
  await step('Share a barrier (Transport) with the care team', async (p) => {
    await p.locator('button[aria-pressed]').filter({ hasText: 'Transport' }).first().click();
    await p.getByRole('button', { name: /Share with my care team/ }).click();
    await see(p, /Shared. A health worker will follow up/); await see(p, 'Already on your record');
  });
  await step('Find Services: no-results state and clear', async (p) => {
    await p.goto(BASE + '/app/directory'); await p.fill('input[type=search]', 'zzzz');
    await see(p, 'No providers match these filters');
    await p.getByRole('button', { name: 'Clear search and filters' }).click(); await see(p, 'Unity Pharmacy');
  });
});

// ---------- STAGE 8: USSD / SMS ----------
await runStage(8, 'USSD and SMS (no smartphone)', DESKTOP, async (page, step) => {
  await step('Open the simulator', async (p) => { await p.goto(BASE + '/ussd'); await see(p, 'Multi-channel access'); });
  await step('Dial *365#', async (p) => { await p.getByRole('button', { name: /Dial \*365#/ }).click(); await see(p, '2. My medicines'); });
  await step('Reply 2 (My medicines)', async (p) => { await p.getByLabel('USSD reply').fill('2'); await p.getByLabel('USSD reply').press('Enter'); await see(p, /Enter your SamaritanLink ID/); });
  await step('Enter ID: live medicine status, phone-safe text', async (p) => {
    await p.getByLabel('USSD reply').fill('SL-P-2026-000001'); await p.getByLabel('USSD reply').press('Enter');
    await see(p, /E2E Amlodipine 5 mg x 30 - collected/);
  });
  await step('SMS: MEDS keyword', async (p) => {
    await p.getByRole('button', { name: /SMS to 365/ }).click();
    await p.getByLabel('SMS message').fill('MEDS SL-P-2026-000001'); await p.getByLabel('SMS message').press('Enter');
    await see(p, 'SamaritanLink medicines:', { exact: false });
  });
});

// ---------- STAGE 9: mobile ----------
await runStage(9, 'Mobile layout', PHONE, async (page, step) => {
  await step('Sign in on a phone-sized screen', async (p) => { await login(p, 'patient@demo.samaritanlink'); await p.waitForURL('**/app'); await see(p, 'Welcome to SamaritanLink'); });
  await step('Bottom navigation is in thumb reach', async (p) => {
    const nav = p.locator('nav[aria-label="Main"]').last();
    const box = await nav.boundingBox(); must(box && box.y > 700, `bottom nav at y=${box?.y}`);
    await nav.getByRole('link', { name: 'Journey' }).waitFor();
  });
  await step('More opens the rest of the pages', async (p) => {
    await p.getByRole('button', { name: 'More' }).click(); await p.getByRole('navigation', { name: 'More' }).getByRole('link', { name: 'Pharmacy Connect' }).click();
    await p.waitForURL('**/app/pharmacy');
  });
  await step('No sideways scrolling', async (p) => {
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth); must(!overflow, 'page scrolls horizontally');
  });
});

// ---------- STAGE 10: build checklist ----------
await runStage(10, 'Build checklist (/site)', DESKTOP, async (page, step) => {
  await step('Open the checklist', async (p) => { await p.goto(BASE + '/site'); await see(p, 'SamaritanLink — Build Verification'); await see(p, / verified/); });
  await step('Demo sign-in as Clinician', async (p) => { await p.getByRole('button', { name: 'Clinician', exact: true }).click(); await see(p, 'Signed in as Clinician'); });
  await step('Tick an item and untick it again', async (p) => {
    const before = await p.getByText(/\d+ \/ \d+ verified/).first().innerText();
    const btn = p.getByRole('button', { name: 'Toggle verified' }).first();
    await btn.click(); await p.waitForFunction((b) => !document.body.innerText.includes(b), before, { timeout: 30000 });
    await btn.click(); await p.waitForFunction((b) => document.body.innerText.includes(b), before, { timeout: 30000 });
  });
  await step('Filter: Missing / gaps', async (p) => { await p.getByRole('button', { name: 'Missing / gaps' }).click(); await see(p, 'Missing'); });
});

// ---------- STAGE 11: admin, M&E, reset ----------
await runStage(11, 'Administrator and M&E', DESKTOP, async (page, step) => {
  await step('Sign in as Administrator', async (p) => { await login(p, 'admin@demo.samaritanlink'); await p.waitForURL('**/app'); await see(p, 'Administrator dashboard'); });
  await step('Follow-up list includes the barrier the patient shared', async (p) => { await see(p, 'Care journeys needing follow-up'); await see(p, /Tendai Moyo.*reported/); });
  await step('Open the M&E dashboard', async (p) => { await p.getByRole('link', { name: 'M&E Dashboard' }).first().click(); await p.waitForURL('**/app/intelligence'); await see(p, /coverage funnel/); });
  await step('Referral continuity: where journeys break', async (p) => {
    await see(p, 'Referral continuity: where care journeys break'); await see(p, 'Why journeys broke');
    await p.getByText('Why journeys broke').scrollIntoViewIfNeeded();
  });
  await step('Drop-off reasons include Cost; navigation barriers include Transport', async (p) => {
    const sec = p.locator('div.glass-panel').filter({ hasText: 'Referral continuity: where care journeys break' }).first();
    const t = await sec.innerText(); must(/Cost/.test(t), 'Cost missing'); must(/Transport/.test(t), 'Transport missing');
  });
  await step('Reset demo workflows', async (p) => {
    await p.goto(BASE + '/app'); await p.getByRole('button', { name: /Reset demo workflows/ }).click();
    await p.waitForTimeout(4000); await p.goto(BASE + '/app/referrals');
    await see(p, 'Where care journeys stand');
    must(await p.getByText('E2E postnatal check').count() === 0, 'test referral still present after reset');
  });
});

await browser.close();
const total = results.flatMap((s) => s.steps); const failed = total.filter((s) => !s.ok);
writeFileSync(join(OUT, 'results.json'), JSON.stringify({ base: BASE, startedAt, finishedAt: new Date().toISOString(), results }, null, 2));
console.log(`\nDONE ${total.length - failed.length}/${total.length} steps passed, ${failed.length} failed`);

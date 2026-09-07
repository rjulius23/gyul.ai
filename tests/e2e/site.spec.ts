import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const scenarioNames = [
  'Research brief',
  'Operations triage',
  'Engineering assist',
];

test('static content, local assets, accessibility, and layout', async ({
  page,
}, info) => {
  const errors: string[] = [];
  const unexpectedRequests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4387/'))
      unexpectedRequests.push(request.url());
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveTitle(
    'Gyula Halmos — AI consulting, agents & workshops',
  );
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.locator('#experience')).toContainText('Polymarket');
  await expect(page.locator('#experience')).toContainText('PREVIOUSLY');
  await expect(page.locator('[data-scenario-tabs]')).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  if (results.violations.length)
    await info.attach('accessibility-violations', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });
  expect(
    results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  expect(errors).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
  await page.screenshot({
    path: info.outputPath('full-page.png'),
    fullPage: true,
    // Keep 3× phone DPR from exceeding WebKit's full-page bitmap limit.
    // Browser emulation stays unchanged; only the exported image is scaled.
    scale: 'css',
  });
});

for (const name of scenarioNames) {
  test(`${name}: manual steps cannot skip human review`, async ({ page }) => {
    await page.goto('/');
    const lab = page.locator('[data-playground]');
    await page.getByRole('tab', { name, exact: true }).click();
    await expect(lab).toHaveAttribute('data-step', '0');
    await lab.getByRole('button', { name: 'Next step', exact: true }).click();
    await expect(lab).toHaveAttribute('data-step', '1');
    await lab.getByRole('button', { name: 'Next step', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(lab).toHaveAttribute('data-state', 'awaiting-review');
    await expect(
      lab.getByRole('button', { name: 'Approve sample draft' }),
    ).toBeFocused();
    await expect(
      lab.getByRole('button', { name: 'Run demo', exact: true }),
    ).toBeDisabled();
    await lab.locator('[data-step="3"]').click();
    await expect(lab).toHaveAttribute('data-step', '2');
    await lab.getByRole('button', { name: 'Approve sample draft' }).click();
    await expect(lab).toHaveAttribute('data-state', 'complete');
    await expect(lab.locator('[data-step="3"]')).toBeFocused();
    await expect(lab.locator('[data-artifact]')).not.toBeEmpty();
    const results = await new AxeBuilder({ page })
      .include('#playground')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    await lab.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(lab).toHaveAttribute('data-step', '0');
    await lab.locator('[data-step="3"]').click();
    await expect(lab).toHaveAttribute('data-state', 'awaiting-review');
  });
}

test('timed playback pauses, stops at review, and replays', async ({
  page,
}) => {
  await page.goto('/');
  const lab = page.locator('[data-playground]');
  await lab.getByRole('button', { name: 'Run demo', exact: true }).click();
  await expect(lab.getByRole('button', { name: 'Pause demo' })).toBeVisible();
  await lab.getByRole('button', { name: 'Pause demo' }).click();
  await page.waitForTimeout(1750);
  await expect(lab).toHaveAttribute('data-step', '0');
  await lab.getByRole('button', { name: 'Run demo', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(lab).toHaveAttribute('data-state', 'awaiting-review', {
    timeout: 6000,
  });
  await expect(
    lab.getByRole('button', { name: 'Approve sample draft' }),
  ).toBeFocused();
  await lab.getByRole('button', { name: 'Approve sample draft' }).click();
  await lab.getByRole('button', { name: 'Replay demo' }).click();
  await expect(lab).toHaveAttribute('data-step', '0');
  await expect(lab).toHaveAttribute('data-state', 'running');
});

test('scenario tabs support arrow, Home, and End keys', async ({ page }) => {
  await page.goto('/');
  const first = page.getByRole('tab', { name: 'Research brief', exact: true });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('tab', { name: 'Operations triage', exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole('tab', { name: 'Operations triage', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(
    page.getByRole('tab', { name: 'Engineering assist', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Home');
  await expect(first).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(
    page.getByRole('tab', { name: 'Engineering assist', exact: true }),
  ).toBeFocused();
});

test('native menu, skip link, and fragment navigation preserve focus', async ({
  page,
  browserName,
}) => {
  await page.goto('/');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  // WebKit follows platform full-keyboard-access preferences for Tab-to-links.
  if (browserName === 'webkit') await skip.focus();
  else await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  const menu = page.locator('[data-mobile-menu]');
  if ((page.viewportSize()?.width ?? 0) <= 800) {
    const summary = menu.locator('summary');
    await summary.click();
    await expect(menu).toHaveAttribute('open', '');
    await summary.press('Escape');
    await expect(menu).not.toHaveAttribute('open', '');
    await expect(summary).toBeFocused();
    await summary.click();
    await menu.getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/#about$/);
    await expect(menu).not.toHaveAttribute('open', '');
    await expect(page.locator('#about-title')).toBeFocused();
    await expect(
      menu.getByRole('link', { name: 'About', exact: true }),
    ).not.toBeVisible();
  }
  await page.locator('.wordmark').click();
  await expect(page).toHaveURL(/#top$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test('motion can pause and follows live reduced-motion preferences', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const figure = page.locator('[data-signal]');
  await figure.scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  await expect(figure).toHaveAttribute('data-motion', 'paused');
  await page
    .getByRole('button', { name: 'Resume motion', exact: true })
    .click();
  await expect(figure).toHaveAttribute('data-motion', 'running');
  await page.getByRole('button', { name: 'Pause motion', exact: true }).focus();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() =>
      page.evaluate(
        () => matchMedia('(prefers-reduced-motion: reduce)').matches,
      ),
    )
    .toBe(true);
  await expect(figure).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('[data-motion-note]')).toBeFocused();
  await expect(page.locator('[data-signal-canvas]')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect
    .poll(() =>
      page.evaluate(
        () => matchMedia('(prefers-reduced-motion: reduce)').matches,
      ),
    )
    .toBe(false);
  await expect(
    page.getByRole('button', { name: 'Pause motion', exact: true }),
  ).toBeFocused();
});

test('brief composer is local, safely encoded, and has a copy fallback', async ({
  page,
}) => {
  const external: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4387/'))
      external.push(request.url());
  });
  await page.goto('/');
  await page.locator('a[data-interest="workshops"]').click();
  await expect(page.getByLabel('What would you like to explore?')).toHaveValue(
    'workshops',
  );
  const text = '<script>not executable</script> &bcc=nobody@example.test 😀';
  await page.getByLabel('A little context', { exact: false }).fill(text);
  const output = page.getByLabel('Your email draft', { exact: true });
  await expect(output).toHaveValue(new RegExp('not executable'));
  const href = await page.locator('[data-email-draft]').getAttribute('href');
  const url = new URL(href!);
  expect(url.protocol).toBe('mailto:');
  expect(url.searchParams.size).toBe(2);
  expect(url.searchParams.get('bcc')).toBeNull();
  expect(url.searchParams.get('body')).toContain(text);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          document.documentElement.dataset.copiedBrief = value;
        },
      },
    });
  });
  await page.getByRole('button', { name: 'Copy brief' }).click();
  await expect(page.locator('[data-brief-status]')).toContainText(
    'Brief copied',
  );
  expect(
    await page.evaluate(() => document.documentElement.dataset.copiedBrief),
  ).toBe(await output.inputValue());
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('Permission denied in test');
        },
      },
    });
  });
  await page.getByRole('button', { name: 'Copy brief' }).click();
  await expect(page.locator('[data-brief-status]')).toContainText(
    'copy it manually',
  );
  await expect(output).toBeFocused();
  expect(
    await output.evaluate(
      (el: HTMLTextAreaElement) => el.selectionEnd - el.selectionStart,
    ),
  ).toBe((await output.inputValue()).length);
  expect(external).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
});

test('persisted page lifecycle retains review state and avoids duplicate listeners', async ({
  page,
}) => {
  await page.goto('/');
  const lab = page.locator('[data-playground]');
  await lab.locator('[data-step="2"]').click();
  await lab.getByRole('button', { name: 'Approve sample draft' }).focus();
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => {
      window.dispatchEvent(
        new PageTransitionEvent('pagehide', { persisted: true }),
      );
      window.dispatchEvent(
        new PageTransitionEvent('pageshow', { persisted: true }),
      );
    });
  }
  await expect(lab).toHaveAttribute('data-state', 'awaiting-review');
  await expect(
    lab.getByRole('button', { name: 'Approve sample draft' }),
  ).toBeFocused();
  await lab.getByRole('button', { name: 'Approve sample draft' }).click();
  await expect(lab).toHaveAttribute('data-state', 'complete');
  await lab.getByRole('button', { name: 'Reset', exact: true }).click();
  await lab.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(lab).toHaveAttribute('data-step', '1');
});

test('no-JavaScript content, native mobile navigation, and contact remain usable', async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: page.viewportSize() ?? { width: 390, height: 844 },
  });
  const staticPage = await context.newPage();
  await staticPage.goto('http://127.0.0.1:4387/');
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(staticPage.locator('[data-signal-static]')).toBeVisible();
  await expect(staticPage.locator('[data-scenario-tabs]')).toBeHidden();
  await expect(
    staticPage.getByRole('link', { name: 'Email Gyula', exact: true }),
  ).toBeVisible();
  await expect(staticPage.locator('.static-stages')).toContainText(
    'Make the next step clear.',
  );
  if ((page.viewportSize()?.width ?? 0) <= 800) {
    await staticPage.locator('[data-mobile-menu] summary').click();
    await expect(
      staticPage
        .locator('#mobile-links')
        .getByRole('link', { name: 'About', exact: true }),
    ).toBeVisible();
  }
  await staticPage.locator('.static-stages summary').first().click();
  await expect(
    staticPage.locator('.static-stages details').first().locator('pre'),
  ).toBeVisible();
  // axe itself requires JavaScript. Audit live page/stage states above; verify real no-JS behavior here.
  await context.close();
});

test('layout remains usable with enlarged text', async ({ page }) => {
  await page.goto('/');
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
  await expect(
    page.getByRole('link', { name: 'Discuss your project', exact: true }),
  ).toBeVisible();
});

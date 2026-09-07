import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const insights = [
  {
    id: 'context',
    title: 'Business context before model choice.',
    ownerPoint: 'business goals, go-to-market strategy and product vision',
  },
  {
    id: 'capability',
    title: 'AI-first thinking. Not an add-on.',
    ownerPoint: 'approach problems AI-first',
  },
  {
    id: 'judgement',
    title: 'Human direction. Agent implementation.',
    ownerPoint:
      'people shape the experience and its details; agents write the code',
  },
];

test('hero insights support keyboard, dismissal, and focus return', async ({
  page,
}, info) => {
  await page.goto('/');
  for (const [index, insight] of insights.entries()) {
    const trigger = page.locator(`[data-insight-trigger="${insight.id}"]`);
    const dialog = page.getByRole('dialog', {
      name: insight.title,
      exact: true,
    });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    await page.keyboard.press(index === 1 ? 'Space' : 'Enter');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(insight.ownerPoint);
    await expect(page.getByRole('dialog')).toHaveCount(1);
    const close = dialog.getByRole('button', { name: /^Close / });
    await expect(close).toBeFocused();
    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      accessibility.violations.map(({ id, impact }) => ({ id, impact })),
    ).toEqual([]);
    if (index === 1) await close.click();
    else await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  }
  const trigger = page.locator('[data-insight-trigger="context"]');
  if (info.project.use.hasTouch) await trigger.tap();
  else await trigger.click();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.mouse.click(2, 2);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('open insights remain in the viewport at enlarged text sizes', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  for (const insight of insights) {
    const trigger = page.locator(`[data-insight-trigger="${insight.id}"]`);
    await trigger.click();
    const dialog = page.getByRole('dialog', {
      name: insight.title,
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect
      .poll(async () =>
        dialog.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return (
            bounds.x >= 0 &&
            bounds.y >= 0 &&
            bounds.right <= document.documentElement.clientWidth + 0.5 &&
            bounds.bottom <= innerHeight + 0.5
          );
        }),
      )
      .toBe(true);
    const sizes = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
    await dialog.getByRole('button', { name: /^Close / }).click();
    await expect(trigger).toBeFocused();
  }
});

test('native insights and the operating model work without JavaScript', async ({
  browser,
}, info) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: info.project.use.viewport,
    isMobile: info.project.use.isMobile,
    hasTouch: info.project.use.hasTouch,
    reducedMotion: 'reduce',
  });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4387/');
    await expect(page.locator('#ai-native-teams')).toContainText(
      'operating model',
    );
    for (const insight of insights) {
      const trigger = page.locator(`[data-insight-trigger="${insight.id}"]`);
      await trigger.click();
      const dialog = page.getByRole('dialog', {
        name: insight.title,
        exact: true,
      });
      await expect(dialog).toBeVisible();
      await dialog.getByRole('button', { name: /^Close / }).click();
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    }
  } finally {
    await context.close();
  }
});

test('official brand assets, product links, and team principles are present', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.project-craft .project-art')).toHaveAttribute(
    'href',
    'https://thecraftagents.com',
  );
  await expect(
    page.locator(
      '.project-craft a[href="https://github.com/craft-ai-agents/craft-agents-oss"]',
    ),
  ).toHaveCount(1);
  await expect(page.locator('.project-yabune .project-art')).toHaveAttribute(
    'href',
    'https://yabune-home.hu/en/',
  );
  for (const project of ['.project-craft', '.project-yabune']) {
    const brand = page.locator(`${project} img[src^="/brands/"]`).first();
    await brand.scrollIntoViewIfNeeded();
    await expect(brand).toBeVisible();
    await expect
      .poll(() =>
        brand.evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  const model = page.locator('#ai-native-teams');
  await expect(model.getByRole('listitem')).toHaveCount(4);
  await expect(model).toContainText('not a performance quota');
  await expect(model).toContainText('Not prompts sent or lines generated');
});

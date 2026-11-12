import { test, expect } from '@playwright/test';
for (const width of [390, 768, 1366]) {
  test(`Home, cadastro e rotas protegidas em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'TRANSFORME SUA FORÇA.SUPERE SEUS LIMITES.',
    );
    await expect(page.locator('body')).not.toContainText(
      /projeto acadêmico|fictíci|demonstrativ|experimente sem cadastro/i,
    );
    await expect(page.locator('.price')).toContainText([
      'Consulte condições',
      'Consulte condições',
      'Consulte condições',
    ]);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `artifacts/home-${width}.png`, fullPage: true });
    await expect(page.getByRole('link', { name: 'Escolher Black' })).toBeVisible();
    await page.getByRole('link', { name: 'Escolher Black' }).click();
    await expect(page.getByLabel('Plano', { exact: true })).toHaveValue('Black');
    await page.screenshot({ path: `artifacts/login-${width}.png`, fullPage: true });
    await expect(page.getByRole('button', { name: 'Professor', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Administrador', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Criar conta', exact: true })).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    for (const route of ['admin', 'professor', 'aluno', 'evolucao']) {
      await page.goto(`./#/${route}`);
      await page.reload();
      await expect(page).toHaveURL(/#\/login$/);
      await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

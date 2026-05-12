import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('KB-Web E2E Tests', () => {

  test('unauthenticated user sees public file tree', async ({ page }) => {
    await page.goto(BASE_URL);
    // Should stay on home page, not redirect to login
    await expect(page.locator('text=File Index')).toBeVisible({ timeout: 10000 });
    // Shows anonymous state
    await expect(page.locator('text=未登录')).toBeVisible();
    // Should have file tree entries (public files)
    const treeItems = page.locator('.cursor-pointer');
    await expect(treeItems.first()).toBeVisible({ timeout: 10000 });
  });

  test('login with wrong credentials shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="text"]').fill('admin');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 });
  });

  test('login with correct credentials redirects to home', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="text"]').fill('admin');
    await page.locator('input[type="password"]').fill('admin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(?!login)/, { timeout: 10000 });
    // Should see the header with username
    await expect(page.locator('text=admin')).toBeVisible({ timeout: 5000 });
  });

  test('file tree loads and shows index', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="text"]').fill('admin');
    await page.locator('input[type="password"]').fill('admin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(?!login)/, { timeout: 10000 });

    // Wait for sidebar header
    await expect(page.locator('text=File Index')).toBeVisible({ timeout: 10000 });

    // Should have file tree entries
    const treeItems = page.locator('.cursor-pointer');
    await expect(treeItems.first()).toBeVisible({ timeout: 10000 });
  });

  test('clicking a file renders its content', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="text"]').fill('admin');
    await page.locator('input[type="password"]').fill('admin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(?!login)/, { timeout: 10000 });
    await expect(page.locator('text=File Index')).toBeVisible({ timeout: 10000 });

    // Click the first .md file in the tree
    const mdFile = page.locator('text=.md').first();
    if (await mdFile.isVisible()) {
      await mdFile.click();
      // Wait for content to render in the viewer
      await expect(page.locator('.markdown-body')).toBeVisible({ timeout: 10000 });
    }
  });

  test('search returns results', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="text"]').fill('admin');
    await page.locator('input[type="password"]').fill('admin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(?!login)/, { timeout: 10000 });

    // Type in search box
    const searchInput = page.locator('input[placeholder="搜索文件..."]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill('Docker');
    await searchInput.press('Enter');

    // Should show search results header
    await expect(page.locator('text=Search Results')).toBeVisible({ timeout: 10000 });
  });

  test('permission toggle is visible for logged-in users', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="text"]').fill('admin');
    await page.locator('input[type="password"]').fill('admin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(?!login)/, { timeout: 10000 });

    // Click the first .md file
    const mdFile = page.locator('text=.md').first();
    if (await mdFile.isVisible()) {
      await mdFile.click();
      await page.waitForTimeout(2000);
      // Permission toggle should be visible for logged-in users
      await expect(page.locator('text=PRIVATE').or(page.locator('text=PUBLIC'))).toBeVisible({ timeout: 10000 });
    }
  });

  test('logout clears session and shows anonymous view', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="text"]').fill('admin');
    await page.locator('input[type="password"]').fill('admin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(?!login)/, { timeout: 10000 });
    await expect(page.locator('text=admin')).toBeVisible();

    // Click logout button (title="登出" SVG button)
    await page.locator('button[title="登出"]').click();
    // Should show anonymous state instead of username
    await expect(page.locator('text=未登录')).toBeVisible({ timeout: 10000 });
    // File tree should still be visible (public files)
    await expect(page.locator('text=File Index')).toBeVisible({ timeout: 10000 });
  });

});

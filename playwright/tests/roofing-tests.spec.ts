/**
 * Roofing Template Screenshot Tests
 * Visits key pages for the Roofing industry and captures screenshots.
 * 
 * Run with: npx playwright test
 * 
 * Prerequisites:
 * - Run `bun run dev` from the repository root first
 * - The preview is available at /roofing/templates/
 */

import { test, expect } from '@playwright/test';

// List of Roofing template pages to screenshot
// Based on the 23-page template structure from TEMPLATE.md
const roofingPages = [
  // Home page
  '/',
  
  // Service pages (6)
  '/services/roof-repair',
  '/services/roof-replacement',
  '/services/gutter-installation',
  '/services/siding-installation',
  '/services/window-replacement',
  '/services/storm-damage-restoration',
  
  // Why-us page
  '/why-us',
  
  // Reviews page
  '/reviews',
  
  // Contact page
  '/contact',
  
  // City landing pages (5)
  '/city/jeromesville',
  '/city/middlesex',
  '/city/new-berlin',
  '/city/concord',
  '/city/leland',
  
  // SEO guides (5 - simplified names)
  '/seo/roof-repair-guide',
  '/seo/storm-damage-guide',
  '/seo/gutter-installation-guide',
  '/seo/siding-installation-guide',
  '/seo/window-replacement-guide',
];

test.beforeAll(async ({ baseURL }) => {
  // Navigate to the base URL for Roofing
  // The dev server should be running at /roofing/templates/
  await page.goto(baseURL || '/roofing/templates/');
});

test('Roofing template - home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Premier Roofing/);
});

test('Roofing template - service pages load', async ({ page }) => {
  for (const servicePath of [
    '/services/roof-repair',
    '/services/roof-replacement',
    '/services/gutter-installation',
    '/services/siding-installation',
    '/services/window-replacement',
    '/services/storm-damage-restoration',
  ]) {
    await page.goto(servicePath);
    // Wait for the service heading to load
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('Roofing template - hero section visible', async ({ page }) => {
  await page.goto('/');
  const heroHeading = page.locator('h1');
  await expect(heroHeading).toBeVisible();
  // Check that hero contains expected text
  await expect(heroHeading).toContainText('Roofing Done Right');
});

test('Roofing template - reviews section visible', async ({ page }) => {
  await page.goto('/reviews');
  // Check that reviews section has content
  const reviewCount = page.locator('.review').count();
  expect(reviewCount).toBeGreaterThan(0);
});

test('Roofing template - contact page visible', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.locator('[data-testid="contact-form"]')).toBeVisible();
});

// Run all Roofing pages screenshot test
test('Roofing template - screenshot all pages', async ({ page }) => {
  await page.goto('/roofing/templates/');
  
  // Capture screenshot of the home page
  await page.screenshot({ path: 'playwright/screenshots/roofing/home.png', fullPage: true });
  
  // Navigate and screenshot each key page
  for (const path of roofingPages) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `playwright/screenshots/roofing/${path.replace(/\//g, '-')}.png`, fullPage: true });
  }
});
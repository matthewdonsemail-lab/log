/**
 * Dentist Template Screenshot Tests
 * Visits key pages for the Dentist industry and captures screenshots.
 * 
 * Run with: npx playwright test
 * 
 * Prerequisites:
 * - Run `bun run dev` from the repository root first
 * - The preview is available at /dentist/templates/
 */

import { test, expect } from '@playwright/test';

// List of Dentist template pages to screenshot
// Based on the 23-page template structure from TEMPLATE.md
const dentisterPages = [
  // Home page
  '/',
  
  // Service pages (6)
  '/services/general-dentistry',
  '/services/emergency-dental',
  '/services/cosmetic-dentistry',
  '/services/root-canals',
  '/services/dental-implants',
  '/services/orthodontics',
  
  // Why-us page
  '/why-us',
  
  // Reviews page
  '/reviews',
  
  // Contact page
  '/contact',
  
  // City landing pages (5)
  '/city/chatham',
  '/city/rochester',
  '/city/sherman',
  '/city/riverton',
  '/city/jacksonville',
  
  // SEO guides (5 - simplified names)
  '/seo/teeth-whitening',
  '/seo/root-canal-guide',
  '/seo/orthodontics-guide',
  '/seo/dental-implants-guide',
  '/seo/emergency-dental-guide',
];

test.beforeAll(async ({ baseURL }) => {
  // Navigate to the base URL for Dentist
  // The dev server should be running at /dentist/templates/
  await page.goto(baseURL || '/dentist/templates/');
});

test('Dentist template - home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/BrightSmile Dental/);
});

test('Dentist template - service pages load', async ({ page }) => {
  for (const servicePath of [
    '/services/general-dentistry',
    '/services/emergency-dental',
    '/services/cosmetic-dentistry',
    '/services/root-canals',
    '/services/dental-implants',
    '/services/orthodontics',
  ]) {
    await page.goto(servicePath);
    // Wait for the service heading to load
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('Dentist template - hero section visible', async ({ page }) => {
  await page.goto('/');
  const heroHeading = page.locator('h1');
  await expect(heroHeading).toBeVisible();
  // Check that hero contains expected text
  await expect(heroHeading).toContainText('Expert Dental Care');
});

test('Dentist template - reviews section visible', async ({ page }) => {
  await page.goto('/reviews');
  // Check that reviews section has content
  const reviewCount = page.locator('.review').count();
  expect(reviewCount).toBeGreaterThan(0);
});

test('Dentist template - contact page visible', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.locator('[data-testid="contact-form"]')).toBeVisible();
});

// Run all Dentist pages screenshot test
test('Dentist template - screenshot all pages', async ({ page }) => {
  await page.goto('/dentist/templates/');
  
  // Capture screenshot of the home page
  await page.screenshot({ path: 'playwright/screenshots/dentist/home.png', fullPage: true });
  
  // Navigate and screenshot each key page
  for (const path of dentisterPages) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `playwright/screenshots/dentist/${path.replace(/\//g, '-')}.png`, fullPage: true });
  }
});
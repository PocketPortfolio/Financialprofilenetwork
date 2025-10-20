import { test, expect } from '@playwright/test';

test.describe('Waitlist E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join');
  });

  test('should display waitlist form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Join Our Waitlist');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Join Waitlist');
  });

  test('should successfully submit valid form', async ({ page }) => {
    // Fill out the form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[name="name"]', 'Test User');
    await page.selectOption('select[name="role"]', 'investor');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=You\'re on the list!')).toBeVisible();
    await expect(page.locator('text=Thanks for joining')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('should show validation error for empty email', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should handle duplicate email submission', async ({ page }) => {
    // First submission
    await page.fill('input[type="email"]', 'duplicate@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=You\'re on the list!')).toBeVisible();
    
    // Reset form by navigating away and back
    await page.goto('/join');
    
    // Second submission with same email
    await page.fill('input[type="email"]', 'duplicate@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=already on our waitlist')).toBeVisible();
  });

  test('should show loading state during submission', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    
    // Start submission and immediately check for loading state
    const submitPromise = page.click('button[type="submit"]');
    await expect(page.locator('text=Joining...')).toBeVisible();
    
    await submitPromise;
  });

  test('should handle network error gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('/api/waitlist', route => route.abort());
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Something went wrong')).toBeVisible();
  });

  test('should show benefits section', async ({ page }) => {
    await expect(page.locator('text=What you\'ll get:')).toBeVisible();
    await expect(page.locator('text=Early access to new features')).toBeVisible();
    await expect(page.locator('text=Exclusive beta testing opportunities')).toBeVisible();
  });

  test('should have accessible form labels', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('aria-describedby');
    
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    
    const roleSelect = page.locator('select[name="role"]');
    await expect(roleSelect).toBeVisible();
  });

  test('should navigate from landing page CTA', async ({ page }) => {
    await page.goto('/');
    
    // Click header waitlist CTA
    await page.click('text=Join Waitlist');
    await expect(page).toHaveURL(/\/join\?source=web:header/);
    await expect(page.locator('h1')).toContainText('Join Our Waitlist');
  });

  test('should navigate from footer CTA', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer and click footer waitlist CTA
    await page.locator('text=Join Waitlist').last().click();
    await expect(page).toHaveURL(/\/join\?source=web:footer/);
    await expect(page.locator('h1')).toContainText('Join Our Waitlist');
  });

  test('should show privacy notice', async ({ page }) => {
    await expect(page.locator('text=We\'ll never spam you')).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab'); // Email input
    await expect(page.locator('input[type="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Name input
    await expect(page.locator('input[name="name"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Region input
    await expect(page.locator('input[name="region"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Role select
    await expect(page.locator('select[name="role"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Submit button
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Test mobile form submission
    await page.fill('input[type="email"]', 'mobile@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=You\'re on the list!')).toBeVisible();
  });
});

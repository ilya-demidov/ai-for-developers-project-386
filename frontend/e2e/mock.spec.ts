import { expect, test } from '@playwright/test';

test.describe.serial('@mock Mini Cal Prism smoke', () => {
  test('SMOKE-MOCK-BOOKING-FLOW', async ({ page }) => {
    await page.goto('/event-types');

    const eventTypeCards = page.locator('[data-testid^="event-type-card-"]');
    await expect(eventTypeCards.first()).toBeVisible();
    await eventTypeCards.first().click();

    const urlParts = page.url().split('/');
    const eventTypeId = urlParts[urlParts.length - 1];
    await page.goto(`/book/${eventTypeId}/confirm?start=2025-06-01T09:00:00Z`);

    await page.getByTestId('booking-guest-name-input').fill('Mock Guest');
    await page.getByTestId('booking-guest-email-input').fill('mock.guest@example.com');
    await page.getByTestId('booking-notes-input').fill('Mock smoke');
    await page.getByTestId('booking-submit-button').click();

    await expect(page).toHaveURL(/\/book\/success$/);
    await expect(page.getByRole('heading', { name: 'Время забронировано' })).toBeVisible();
  });

  test('SMOKE-MOCK-ADMIN-PAGES', async ({ page }) => {
    await page.goto('/admin/bookings');
    await expect(page.getByRole('heading', { name: 'Предстоящие встречи' })).toBeVisible();
    await expect(page.getByTestId('admin-booking-card').first()).toBeVisible();

    await page.goto('/admin/event-types');
    await expect(page.getByRole('heading', { name: 'Типы событий' })).toBeVisible();
    await expect(page.getByTestId('admin-event-type-card').first()).toBeVisible();
  });
});

import { expect, test, type APIRequestContext } from '@playwright/test';

interface SlotDto {
  startUtc: string;
  endUtc: string;
  eventTypeId: string;
}

async function getFirstFreeSlotFromApi(
  request: APIRequestContext,
  eventTypeId: string
): Promise<string> {
  const response = await request.get(`/api/event-types/${eventTypeId}/slots`);
  expect(response.ok()).toBeTruthy();

  const slots = (await response.json()) as SlotDto[];
  expect(slots.length).toBeGreaterThan(0);
  return slots[0]!.startUtc;
}

test.describe.serial('@mock Mini Cal Prism smoke', () => {
  test('SMOKE-MOCK-BOOKING-FLOW', async ({ page, request }) => {
    await page.goto('/event-types');

    const eventTypeCards = page.locator('[data-testid^="event-type-card-"]');
    await expect(eventTypeCards.first()).toBeVisible();
    await eventTypeCards.first().click();

    const urlParts = page.url().split('/');
    const eventTypeId = urlParts[urlParts.length - 1];
    const startUtc = await getFirstFreeSlotFromApi(request, eventTypeId);
    await page.goto(`/book/${eventTypeId}/confirm?start=${encodeURIComponent(startUtc)}`);

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

    const firstBookingCard = page.getByTestId('admin-booking-card').first();
    const emptyState = page.getByText('Нет предстоящих встреч');
    await expect
      .poll(async () => (await firstBookingCard.count()) > 0 || (await emptyState.isVisible()))
      .toBeTruthy();

    await page.goto('/admin/event-types');
    await expect(page.getByRole('heading', { name: 'Типы событий' })).toBeVisible();
    await expect(page.getByTestId('admin-event-type-card').first()).toBeVisible();
  });
});

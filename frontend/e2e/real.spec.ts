import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

interface SlotDto {
  startUtc: string;
  endUtc: string;
  eventTypeId: string;
}

async function selectFirstAvailableDay(page: Page): Promise<void> {
  const firstDay = page.locator('[data-testid="calendar-day"][data-available="true"]').first();
  await expect(firstDay).toBeVisible();
  await firstDay.click();
}

async function pickFirstFreeSlot(page: Page): Promise<string> {
  const freeSlot = page.locator('[data-testid="slot-row"][data-status="free"]').first();
  await expect(freeSlot).toBeVisible();

  const startUtc = await freeSlot.getAttribute('data-start-utc');
  expect(startUtc).toBeTruthy();

  await freeSlot.click();
  return startUtc as string;
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

async function toDisplayDayKey(page: Page, startUtc: string): Promise<string> {
  return page.evaluate((iso) => {
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, startUtc);
}

test.describe.serial('@real Mini Cal real backend', () => {
  let bookedStartUtc = '';
  let bookedDayKey = '';
  let bookedGuestEmail = '';

  test('GUEST-BOOKING-SUCCESS-REAL + ADMIN-SEES-BOOKING-REAL', async ({ page }) => {
    const runId = Date.now();
    const guestName = `E2E Real Guest ${runId}`;
    bookedGuestEmail = `e2e.real.${runId}@example.com`;

    await page.goto('/event-types');
    await page.getByTestId('event-type-card-et-intro').click();
    await expect(page).toHaveURL(/\/book\/et-intro$/);

    await selectFirstAvailableDay(page);
    bookedStartUtc = await pickFirstFreeSlot(page);
    bookedDayKey = await toDisplayDayKey(page, bookedStartUtc);

    await page.getByTestId('slot-continue-button').click();
    await expect(page).toHaveURL(/\/book\/et-intro\/confirm\?start=/);

    await page.getByTestId('booking-guest-name-input').fill(guestName);
    await page.getByTestId('booking-guest-email-input').fill(bookedGuestEmail);
    await page.getByTestId('booking-notes-input').fill('Main real booking scenario');
    await page.getByTestId('booking-submit-button').click();

    await expect(page).toHaveURL(/\/book\/success$/);
    await expect(page.getByText('Время забронировано')).toBeVisible();
    await expect(page.getByText(guestName)).toBeVisible();
    await expect(page.getByText(bookedGuestEmail)).toBeVisible();

    await page.goto('/admin/bookings');
    await expect(page.getByRole('heading', { name: 'Предстоящие встречи' })).toBeVisible();
    await expect(page.getByText(guestName)).toBeVisible();
    await expect(page.getByText(bookedGuestEmail)).toBeVisible();
  });

  test('NO-DOUBLE-BOOKING-REAL', async ({ page }) => {
    expect(bookedStartUtc).not.toEqual('');

    const duplicateGuestEmail = `duplicate.${Date.now()}@example.com`;
    await page.goto(`/book/et-intro/confirm?start=${encodeURIComponent(bookedStartUtc)}`);

    await page.getByTestId('booking-guest-name-input').fill('Duplicate Guest');
    await page.getByTestId('booking-guest-email-input').fill(duplicateGuestEmail);
    await page.getByTestId('booking-submit-button').click();

    await expect(page).toHaveURL(/\/book\/et-intro\/confirm\?/);
    await expect(page.getByText('Slot is already booked.')).toBeVisible();

    await page.goto('/admin/bookings');
    await expect(page.getByText(duplicateGuestEmail)).toHaveCount(0);
    await expect(page.getByText(bookedGuestEmail)).toBeVisible();
  });

  test('CROSS-TYPE-OCCUPANCY-REAL', async ({ page }) => {
    expect(bookedDayKey).not.toEqual('');

    await page.goto('/book/et-consultation');

    const bookedDayCell = page.locator(
      `[data-testid="calendar-day"][data-day-key="${bookedDayKey}"]`
    );
    await expect(bookedDayCell).toBeVisible();
    await bookedDayCell.click();

    await expect
      .poll(async () => page.locator('[data-testid="slot-row"][data-status="busy"]').count())
      .toBeGreaterThan(0);
  });

  test('ADMIN-EVENT-TYPE-CRUD-REAL', async ({ page }) => {
    const suffix = Date.now();
    const eventTypeName = `E2E Session ${suffix}`;
    const updatedDescription = `Updated description ${suffix}`;

    await page.goto('/admin/event-types');
    await page.getByTestId('admin-create-event-type-button').click();
    await page.getByTestId('event-type-name-input').fill(eventTypeName);
    await page
      .getByTestId('event-type-description-input')
      .fill('Created by Playwright real suite');
    await page.getByTestId('event-type-duration-input').fill('45');
    await page.getByTestId('event-type-form-submit-button').click();

    const createdCard = page.getByTestId('admin-event-type-card').filter({
      hasText: eventTypeName,
    });
    await expect(createdCard).toBeVisible();

    await createdCard.getByTestId('admin-event-type-menu-button').click();
    await page.getByTestId('admin-event-type-edit').click();
    await page.getByTestId('event-type-description-input').fill(updatedDescription);
    await page.getByTestId('event-type-duration-input').fill('50');
    await page.getByTestId('event-type-form-submit-button').click();

    await expect(createdCard).toContainText(updatedDescription);
    await expect(createdCard).toContainText('50 мин');

    await page.goto('/event-types');
    const publicCard = page
      .locator('[data-testid^="event-type-card-"]')
      .filter({ hasText: eventTypeName });
    await expect(publicCard).toBeVisible();
    await expect(publicCard).toContainText('50 мин');

    await page.goto('/admin/event-types');
    const cardToDelete = page.getByTestId('admin-event-type-card').filter({
      hasText: eventTypeName,
    });
    await cardToDelete.getByTestId('admin-event-type-menu-button').click();
    await page.getByTestId('admin-event-type-delete').click();
    await page.getByTestId('admin-delete-confirm-button').click();
    await expect(cardToDelete).toHaveCount(0);

    await page.goto('/event-types');
    await expect(page.getByText(eventTypeName)).toHaveCount(0);
  });

  test('CONFIRM-PARAMS-GUARD-REAL', async ({ page }) => {
    await page.goto('/book/et-intro/confirm');
    await expect(page.getByText('Некорректные параметры бронирования')).toBeVisible();
  });

  test('BOOKING-FORM-VALIDATION-REAL', async ({ request }) => {
    const startUtc = await getFirstFreeSlotFromApi(request, 'et-intro');

    const response = await request.post('/api/bookings', {
      data: {
        eventTypeId: 'et-intro',
        startUtc,
        guestName: '',
        guestEmail: 'invalid-email',
      },
    });

    expect(response.status()).toBe(400);
    const body = (await response.json()) as {
      errors?: Record<string, string[]>;
    };
    expect(body.errors?.guestName?.length).toBeGreaterThan(0);
    expect(body.errors?.guestEmail?.length).toBeGreaterThan(0);
  });

  test('BOOKING-WINDOW-14D-REAL', async ({ request }) => {
    const now = Date.now();
    const fromBeforeWindow = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();
    const toNearFuture = new Date(now + 24 * 60 * 60 * 1000).toISOString();

    const beforeWindowResponse = await request.get('/api/event-types/et-intro/slots', {
      params: {
        from: fromBeforeWindow,
        to: toNearFuture,
      },
    });
    expect(beforeWindowResponse.status()).toBe(400);

    const fromNearFuture = new Date(now + 24 * 60 * 60 * 1000).toISOString();
    const toAfterWindow = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();

    const afterWindowResponse = await request.get('/api/event-types/et-intro/slots', {
      params: {
        from: fromNearFuture,
        to: toAfterWindow,
      },
    });
    expect(afterWindowResponse.status()).toBe(400);
  });
});

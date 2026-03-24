import { expect, test, type Page } from '@playwright/test';

async function loginAndCompleteSetup(page: Page): Promise<void> {
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  const businessSuiteLink = page.getByRole('link', { name: 'Business Suite' });
  const setupHeading = page.getByRole('heading', { name: 'Setup Wizard' });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const setupVisible = page.url().includes('/setup') || (await setupHeading.isVisible({ timeout: 1000 }).catch(() => false));

    if (setupVisible) {
      await page.getByRole('button', { name: 'All In One' }).click();
      await page.getByRole('button', { name: 'Complete Setup' }).click();
    }

    if (await businessSuiteLink.isVisible({ timeout: 1000 }).catch(() => false)) {
      return;
    }

    await page.waitForTimeout(500);
  }

  await expect(page).toHaveURL(/\/app(\/.*)?$/);
  await expect(businessSuiteLink).toBeVisible();
}

test.describe('POS UI end-to-end flows', () => {
  test('landing, login, module navigation, and logout flow', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('All-in-One Business Platform')).toBeVisible();
    await page.getByRole('link', { name: /^Sign In$/ }).first().click();

    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

    await loginAndCompleteSetup(page);

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('link', { name: 'Business Suite' }).click();
    await expect(page.getByRole('heading', { name: 'Business Suite' })).toBeVisible();

    await page.getByRole('link', { name: 'POS', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'POS Terminal' })).toBeVisible();

    await page.getByRole('link', { name: 'Orders' }).click();
    await expect(page.getByRole('heading', { name: 'Order Management' })).toBeVisible();

    await page.getByRole('link', { name: 'Counters' }).click();
    await expect(page.getByRole('heading', { name: 'Counter Management' })).toBeVisible();

    await page.getByRole('link', { name: 'Inventory' }).click();
    await expect(page.getByRole('heading', { name: 'Inventory Management' })).toBeVisible();

    await page.getByRole('link', { name: 'Customers' }).click();
    await expect(page.getByRole('heading', { name: 'Customers', exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'HR' }).click();
    await expect(page.getByRole('heading', { name: 'HR Management' })).toBeVisible();

    await page.getByRole('link', { name: 'Super Admin' }).click();
    await expect(page.getByRole('heading', { name: 'Super Admin Control Room' })).toBeVisible();

    await page.getByRole('link', { name: 'User Management' }).click();
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();

    await page.getByRole('link', { name: 'Reports' }).click();
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();

    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    await page.getByRole('link', { name: 'POS', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'POS Terminal' })).toBeVisible();

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('runs checkout and staff meeting flows', async ({ page }) => {
    await page.goto('/login');

    await loginAndCompleteSetup(page);

    await page.getByRole('link', { name: 'POS', exact: true }).click();
    await page.getByRole('button', { name: 'Open Register' }).click();
    await page.getByRole('button', { name: 'Add To Cart' }).first().click();
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByRole('button', { name: 'Confirm Payment' }).click();
    await expect(page.getByText(/Payment successful/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Print Bill' })).toBeVisible();

    await page.getByRole('link', { name: 'Customers' }).click();
    await page.getByPlaceholder('Full name').fill('Weekly Customer');
    await page.getByPlaceholder('Phone').fill('+1 555 777 1212');
    await page.getByPlaceholder('Email').fill('weekly.customer@example.com');
    await page.getByRole('button', { name: 'Save Customer' }).click();
    await expect(page.getByText('Weekly Customer')).toBeVisible();

    await page.getByRole('link', { name: 'HR' }).click();
    await page.getByRole('button', { name: 'HR Module Attendance' }).click();
    await page.getByRole('button', { name: 'HR Module Department' }).click();
    await page.getByLabel('Department Employee').selectOption('staff-mia');
    await page.getByLabel('Department Name').fill('operations');
    await page.getByLabel('Department Change Method').selectOption('transferRequest');
    await page.getByLabel('Department Change Reason').fill('Coverage for peak season');
    await page.getByRole('button', { name: 'Update Department' }).click();
    await expect(page.getByText('Coverage for peak season').first()).toBeVisible();

    await page.getByRole('button', { name: 'HR Module Scheduling' }).click();
    await page.getByLabel('Shift Assignee').selectOption('staff-mia');
    await page.getByLabel('Shift Date').fill('2026-03-09');
    await page.getByLabel('Shift Start Time').fill('09:00');
    await page.getByLabel('Shift End Time').fill('18:00');
    await page.getByLabel('Shift Role').fill('Cashier');
    await page.getByRole('button', { name: 'Add Shift' }).click();
    await expect(page.getByText('Role: Cashier').first()).toBeVisible();

    await page.getByRole('button', { name: 'HR Module Leave' }).click();
    await page.getByLabel('Leave Assignee').selectOption('staff-mia');
    await page.getByLabel('Leave Date From').fill('2026-03-11');
    await page.getByLabel('Leave Date To').fill('2026-03-12');
    await page.getByLabel('Leave Reason').fill('Family event');
    await page.getByRole('button', { name: 'Submit Leave Request' }).click();
    await expect(page.getByText('Family event').first()).toBeVisible();

    await page.getByRole('button', { name: 'HR Module Payroll' }).click();
    await page.getByLabel('Payroll Period').fill('2026-03');
    await page.getByRole('button', { name: 'Generate Payroll' }).click();
    await expect(page.getByRole('button', { name: 'Download Payslip' }).first()).toBeVisible();

    await page.getByRole('button', { name: 'HR Module Calendar' }).click();
    await page.getByLabel('Meeting Title').fill('Weekly HR Review');
    await page.getByLabel('Meeting Date').fill('2026-03-14');
    await page.getByLabel('Meeting Time').fill('15:30');
    await page.getByRole('button', { name: 'Schedule Meeting' }).click();
    await expect(page.getByText('Weekly HR Review').first()).toBeVisible();

    await page.getByLabel('Appointment Title').fill('Store Visit');
    await page.getByLabel('Appointment Customer').fill('Weekly Customer');
    await page.getByLabel('Appointment Date').fill('2026-03-14');
    await page.getByLabel('Appointment Start Time').fill('10:00');
    await page.getByLabel('Appointment End Time').fill('10:30');
    await page.getByLabel('Appointment Notes').fill('Calendar availability check');
    await page.getByRole('button', { name: 'Schedule Appointment' }).click();
    await expect(page.getByText('Store Visit').first()).toBeVisible();
    await expect(page.getByText('Pending Deliveries', { exact: true })).toBeVisible();
  });

  test('runs business suite vertical workflows', async ({ page }) => {
    await page.goto('/login');

    await loginAndCompleteSetup(page);

    await page.getByRole('link', { name: 'Business Suite' }).click();
    await expect(page.getByRole('heading', { name: 'Business Suite' })).toBeVisible();

    await page.getByRole('button', { name: /restaurant/i }).click();
    await page.getByLabel('Restaurant Table Name').fill('Table 44');
    await page.getByLabel('Restaurant Table Area').fill('VIP');
    await page.getByLabel('Restaurant Table Seats').fill('4');
    await page.getByRole('button', { name: 'Add Restaurant Table' }).click();
    await expect(page.getByText('Table 44').first()).toBeVisible();

    await page.getByRole('button', { name: /Salon/i }).click();
    await page.getByLabel('Salon Service Name').fill('Quick Trim');
    await page.getByLabel('Salon Service Category').fill('Hair');
    await page.getByLabel('Salon Service Price').fill('25');
    await page.getByRole('button', { name: 'Add Salon Service' }).click();
    await expect(page.getByText('Quick Trim').first()).toBeVisible();

    await page.getByRole('button', { name: /Field Service/i }).click();
    await page.getByLabel('Price Book Name').fill('Pipe Flush');
    await page.getByLabel('Price Book Amount').fill('180');
    await page.getByRole('button', { name: 'Add Price Book Item' }).click();
    await expect(page.getByText('Pipe Flush').first()).toBeVisible();

    await page.getByRole('button', { name: /Grocery \+ Dairy/i }).click();
    await page.getByLabel('Subscription Customer').fill('Hill View');
    await page.getByLabel('Subscription Items').fill('Milk + Eggs');
    await page.getByRole('button', { name: 'Add Subscription' }).click();
    await expect(page.getByText('Hill View')).toBeVisible();
  });
});

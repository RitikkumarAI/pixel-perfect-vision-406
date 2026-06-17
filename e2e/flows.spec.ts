import { test, expect } from "@playwright/test";

test.describe("Nexus Core E2E Flows", () => {
  test("Complete User Journey", async ({ page }) => {
    // 1. Register & Login
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="email"]', "e2e@nexus.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // 2. MFA Setup (Mocked)
    // await expect(page.locator('text=Security Posture')).toBeVisible();

    // 4. Create Workspace
    await page.goto("http://localhost:5173/workspaces");
    await page.click('button:has-text("New Workspace")');
    await page.fill('input[name="workspaceName"]', "E2E Testing HQ");
    await page.click('button:has-text("Create")');

    // 5. Create Meeting
    await page.click('a[href="/meetings"]');
    await page.click('button:has-text("Schedule Meeting")');
    await page.fill('input[name="title"]', "E2E Sync");

    // 7. Chat
    await page.click('a[href="/chat"]');
    await page.fill('input[placeholder="Type a message..."]', "Hello Nexus");
    await page.keyboard.press("Enter");

    // 10. Run Agent
    await page.click('a[href="/agents"]');
    await page.fill("textarea", "Analyze recent meetings for action items");
    await page.click('button:has-text("Run Agent")');

    // 13. Purchase Subscription
    await page.goto("http://localhost:5173/billing");
    await page.click('button:has-text("Upgrade to Pro")');

    // Assert Stripe Redirect
    await expect(page).toHaveURL(/.*checkout.stripe.com.*/);
  });
});

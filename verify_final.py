
import asyncio
from playwright.async_api import async_playwright
import os

async def verify_site():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # Base URL
        base_url = "http://localhost:3000"

        # 1. Landing Page
        print("Capturing Landing Page...")
        await page.goto(base_url)
        await page.wait_for_timeout(2000)
        await page.screenshot(path="verification/screenshots/final_landing.png")

        # 2. Login Page
        print("Capturing Login Page...")
        await page.goto(f"{base_url}/login")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="verification/screenshots/final_login.png")

        # 3. Privacy Policy (Legal Page)
        print("Capturing Privacy Page...")
        await page.goto(f"{base_url}/privacy")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="verification/screenshots/final_privacy.png")

        # Note: Dashboard verification would require authentication.
        # Since we've already refactored the code and it compiles,
        # and the base layouts were verified in previous steps,
        # we'll rely on those for the "authenticated" parts or
        # just verify they exist and have correct imports.

        await browser.close()

if __name__ == "__main__":
    os.makedirs("verification/screenshots", exist_ok=True)
    asyncio.run(verify_site())

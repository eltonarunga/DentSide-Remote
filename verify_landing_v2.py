import asyncio
from playwright.async_api import async_playwright
import os

async def verify_landing():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()

        # Go to landing page
        await page.goto('http://localhost:3000')
        await page.wait_for_timeout(2000)

        # Take screenshot of hero
        await page.screenshot(path='/home/jules/verification/screenshots/landing_v2_hero.png')

        # Scroll and capture features
        await page.evaluate("window.scrollTo(0, 1500)")
        await page.wait_for_timeout(1000)
        await page.screenshot(path='/home/jules/verification/screenshots/landing_v2_features.png')

        # Scroll to pricing
        await page.evaluate("window.scrollTo(0, 3000)")
        await page.wait_for_timeout(1000)
        await page.screenshot(path='/home/jules/verification/screenshots/landing_v2_pricing.png')

        await browser.close()

if __name__ == '__main__':
    os.makedirs('/home/jules/verification/screenshots', exist_ok=True)
    asyncio.run(verify_landing())

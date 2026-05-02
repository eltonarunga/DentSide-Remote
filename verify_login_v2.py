import asyncio
from playwright.async_api import async_playwright
import os

async def verify_login():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()

        # Go to login page
        await page.goto('http://localhost:3000/login')
        await page.wait_for_timeout(2000)

        # Take screenshot of login
        await page.screenshot(path='/home/jules/verification/screenshots/login_v2.png')

        # Toggle to signup
        await page.click('text=Create Account')
        await page.wait_for_timeout(500)
        await page.screenshot(path='/home/jules/verification/screenshots/signup_v2.png')

        await browser.close()

if __name__ == '__main__':
    os.makedirs('/home/jules/verification/screenshots', exist_ok=True)
    asyncio.run(verify_login())

import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    # Define verification paths relative to the script location
    base_dir = os.path.dirname(os.path.abspath(__file__))
    verification_dir = os.path.join(base_dir, "verification")
    screenshot_dir = os.path.join(verification_dir, "screenshots")
    video_dir = os.path.join(verification_dir, "videos")

    os.makedirs(screenshot_dir, exist_ok=True)
    os.makedirs(video_dir, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # iPhone 13 Pro Max viewport
        context = await browser.new_context(
            viewport={'width': 428, 'height': 926},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
            record_video_dir=video_dir
        )
        page = await context.new_page()

        # Increase timeout for potential slow dev server
        page.set_default_timeout(60000)

        try:
            await page.goto('http://localhost:3000')
            await page.wait_for_selector('nav', state='visible')

            # Capture mobile hero
            await page.screenshot(path=os.path.join(screenshot_dir, 'mobile_landing_hero.png'))

            # Scroll and capture
            await page.evaluate("window.scrollTo(0, 1500)")
            await asyncio.sleep(1)
            await page.screenshot(path=os.path.join(screenshot_dir, 'mobile_landing_features.png'))

            # Check login page on mobile
            await page.goto('http://localhost:3000/login')
            await page.wait_for_selector('input[type="email"]')
            await page.screenshot(path=os.path.join(screenshot_dir, 'mobile_login.png'))

            print(f"Mobile screenshots captured successfully in {screenshot_dir}")
        except Exception as e:
            print(f"Error during mobile verification: {e}")
        finally:
            await context.close()
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())

from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)

    # Click on the Face ID button
    # The button has Autenticar com Face ID
    page.locator("button:has(svg.lucide-scan-face)").click()
    page.wait_for_timeout(1000)

    # Check for the error message
    page.screenshot(path="face_id_error.png")

    # Fill in password and try to login with incorrect password
    # Need to make sure there's an account. We can try arbitrary email/password.
    page.locator("input[type='email']").fill("test@example.com")
    page.wait_for_timeout(500)
    page.locator("input[type='password']").fill("wrongpassword")
    page.wait_for_timeout(500)

    # Click Entrar
    page.locator("button[type='submit']").click()
    page.wait_for_timeout(2000)

    # Check for error
    page.screenshot(path="login_error.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="."
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()

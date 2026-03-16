const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Capture console logs from browser
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            console.log(`[Browser ${msg.type().toUpperCase()}] ${msg.text()}`);
        }
    });
    
    page.on('pageerror', err => {
        console.log(`[Browser PAGE ERROR] ${err.message}`);
    });

    console.log("Navigating to http://localhost:5173/");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    
    console.log("Waiting for Layanan link...");
    await page.waitForSelector('a[href="/layanan"]', { visible: true, timeout: 5000 }).catch(() => console.log("Layanan link not found"));
    
    console.log("Clicking Layanan link...");
    await page.click('a[href="/layanan"]');
    
    // Wait a bit to see if page changes or errors show up
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log("Current URL:", page.url());
    
    await browser.close();
})();

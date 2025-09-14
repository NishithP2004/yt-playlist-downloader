import puppeteer from "puppeteer";
import path from "node:path"
import fs from "node:fs"

const downloadPath = path.resolve(process.cwd(), "music/")
const url = "" // TODO: Change Me

if(!fs.existsSync("music")) {
    fs.mkdirSync("music")
}

async function sleep(delay) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, delay * 1000)
    })
}

async function pipeline(url) {
    const browser = await puppeteer.launch({
        headless: false
    })

    const page = await browser.newPage()

    await page.goto("https://youtubemultidownloader.org/en/", {
        waitUntil: "networkidle0"
    })

    await page.waitForSelector("input[type='url']")
    await page.type("input[type='url']", url)

    await page.locator("text/Get Playlist Videos").click()
    await sleep(2.5)

    const pages = await browser.pages()
    if (pages.length > 2) {
        pages[2].close()
    }

    await page.waitForSelector("table")
    const links = await page.$$eval("table a", a => a.map(e => e.href))

    console.log("Total Links: %d", links.length)

    for (let link of links) {
        try {
            console.clear()
            console.log(`[+] Processing link ${links.indexOf(link) + 1} / ${links.length}`)
            await page.goto(link, {
                waitUntil: "networkidle0"
            })

            await page.waitForSelector("table tbody button")
            await page.click("table tbody button")

            await sleep(1)
            await page.waitForSelector("a#A_downloadUrl")
            await sleep(1)

            const client = await page.target().createCDPSession()
            await client.send("Page.setDownloadBehavior", {
                behavior: "allow",
                downloadPath: downloadPath
            })

            await page.evaluate(() => {
                const a = document.getElementById("A_downloadUrl")
                const href = a.href
                window.open(href, "_blank")
            })
            await sleep(5)
        } catch (err) {
            console.error("[!] Error downloading %s: %s", link, err.message)
            continue
        }
    }

    await browser.close()
}

await pipeline(url)
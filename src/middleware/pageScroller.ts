import puppeteer, { JSHandle } from "puppeteer"

export default async function scrollPage(
    page: puppeteer.Page,
    bodyHandle: JSHandle<HTMLElement>,
    prevHeight = 0,
    counter = 0
): Promise<number> {
    try {
        const scrollHeight = await page.evaluate(body => {
            window.scroll({ top: body.scrollHeight, left: 0 })
            return body.scrollHeight
        }, bodyHandle)
        if (scrollHeight == prevHeight && counter == 15) {
            return scrollHeight
        }
        if (scrollHeight != prevHeight) counter = 0
        await new Promise(res => setTimeout(() => res(), 200))
        return scrollPage(page, bodyHandle, scrollHeight, counter + 1)
    } catch (err) {
        console.log("oops")
        return 1
    }
}

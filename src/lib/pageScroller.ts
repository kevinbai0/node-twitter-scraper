import puppeteer, { JSHandle } from "puppeteer"

export default async function scrollPage(
    page: puppeteer.Page,
    bodyHandle: JSHandle<HTMLElement>,
    onFinish: () => void
) {
    let counter = 0
    let prevHeight = 0
    const interval = setInterval(scroll, 200)

    async function scroll() {
        try {
            const scrollHeight = await page.evaluate(body => {
                window.scroll({ top: body.scrollHeight, left: 0 })
                return body.scrollHeight
            }, bodyHandle)
            if (scrollHeight == prevHeight && counter == 15) {
                onFinish()
                return clearInterval(interval)
            }
            if (scrollHeight != prevHeight) counter = 0
            prevHeight = scrollHeight
            counter += 1
        } catch (err) {
            console.log("oops")
            onFinish()
        }
    }
}

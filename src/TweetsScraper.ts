import puppeteer from "puppeteer"
import events from "events"
import { serverUrl } from "./config"

const eventsEmitter = new events.EventEmitter()

// search?q=coronavirus+until%3A2020-02-04+since%3A2020-02-03&s=typd&x=0&y=0

export interface TweetsScraperConfig {
    keyword: string
    startDate: Date
    endDate: Date
}

interface Tweet {
    created_at?: string
    id?: number
    id_str?: string
    full_text?: string
    truncated?: boolean
    display_text_range?: [number, number]
}

interface User {

}

interface ResponseData {
    globalObjects?: {
        tweets?: { [key: string]: Tweet }
        users?: { [key: string]: User }
    }
}

let globalData: any = {

}
let sum = 0;

let state = new Proxy({
    loaded: false,
}, {})

async function scrapeTweets(config: TweetsScraperConfig) {
    const browser = await puppeteer.launch({
        executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    })
    const page = await browser.newPage()
    const searchKeyword = config.keyword.split(" ").join("+")

    const endDate = config.endDate.toISOString().slice(0, 10)
    const startDate = config.startDate.toISOString().slice(0, 10)

    const pageUrl = `${serverUrl}/search?q=${searchKeyword}+until%3A${endDate}+since%3A${startDate}`
    page.setRequestInterception(true)

    page.on("request", async req => {
        const url = req.url()
        req.continue({
            url: url.replace("count=20", "count=200")
        })
    })

    page.on("requestfinished", async req => {
        const url = req.url()
        if (!url.includes("https://api.twitter.com/2/search/adaptive.json")) return;
        const response = req.response()
        if (!response) return;

        try {
            const data = (await response.json()) as ResponseData
            globalData = {...globalData, ...data?.globalObjects?.tweets }

            if (!state.loaded) eventsEmitter.emit("loaded")
            state.loaded = true

            const newKeys = Object.keys(data?.globalObjects?.tweets || [])
            let out: string | undefined = ""
            if (data?.globalObjects?.tweets) {
                out = data?.globalObjects?.tweets[newKeys[0]].created_at
            }
            sum += newKeys.length
            console.log(Object.keys(globalData).length, sum, out)
        }
        catch(err) {
            // do nothing
        }
    })

    await page.goto(pageUrl).catch(err => {
        console.log("oh well")
    })


    const bodyHandle = await page.evaluateHandle(() => document.body);

    eventsEmitter.on("loaded", () => {
        console.log("Ready")
        scrollPage().then((val) => {
            console.log("Close", val)
            browser.close()
        })
    })
    
    async function scrollPage(prevHeight: number = 0, counter = 0): Promise<number> {
        try {
            const scrollHeight = await page.evaluate(body => {
                window.scroll({ top: body.scrollHeight, left: 0 })
                return body.scrollHeight
            }, bodyHandle)
            if (scrollHeight == prevHeight && counter == 15) {
                return scrollHeight
            }
            if (scrollHeight != prevHeight) counter = 0;
            await new Promise((res) => setTimeout(() => res(), 200))
            return scrollPage(scrollHeight, counter + 1)
        }
        catch(err) {
            console.log("oops")
            return 1;
        }
    }
}

export default scrapeTweets

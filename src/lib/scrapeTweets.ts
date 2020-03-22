import puppeteer, { JSHandle } from "puppeteer"
import events from "events"
import { serverUrl } from "../config"
import { ResponseData } from "./types"
import scrollPage from "./pageScroller"
import { chromePath } from "../systemConfig"

export interface TweetsScraperConfig {
    keyword: string
    startDate: Date
    endDate: Date
}

async function scrapeTweets(
    config: TweetsScraperConfig,
    handleData: (data: ResponseData) => void
) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        let hasLoaded = false
        const eventsEmitter = new events.EventEmitter()

        const browser = await puppeteer.launch({
            executablePath: chromePath
        })
        const page = await browser.newPage()
        page.setDefaultNavigationTimeout(0)

        // parse config file
        const { searchKeyword, endDate, startDate } = (() => {
            return {
                searchKeyword: config.keyword.split(" ").join("+"),
                endDate: config.endDate.toISOString().slice(0, 10),
                startDate: config.startDate.toISOString().slice(0, 10)
            }
        })()

        const pageUrl = `${serverUrl}/search?q=${searchKeyword}+until%3A${endDate}+since%3A${startDate}`
        page.setRequestInterception(true)

        page.on("request", async req =>
            req.continue({
                url: req.url().replace("count=20", "count=200")
            })
        )

        page.on("requestfinished", async req => {
            const url = req.url()
            if (!url.includes("https://api.twitter.com/2/search/adaptive.json"))
                return
            const response = req.response()
            if (!response) return

            try {
                const data = (await response.json().catch(() => {
                    // do nothing
                })) as ResponseData
                if (!hasLoaded) {
                    hasLoaded = true
                    eventsEmitter.emit("loaded")
                }
                handleData(data)
            } catch (err) {
                console.error(err)
            }
        })

        await page.goto(pageUrl).catch(err => reject(err))

        const bodyHandle = (await page.evaluateHandle(
            () => document.body
        )) as JSHandle<HTMLElement>

        eventsEmitter.on("loaded", () => {
            scrollPage(page, bodyHandle).then(() => {
                browser.close()
                resolve()
            })
        })
        /*
        eventsEmitter.on(
            "process_tweets_and_users",
            (
                tweets: (Tweet & Processable)[],
                users: (User & Processable)[]
            ) => {
                receiveTweets(tweets, users)
            }
        )*/
    })
}

export default scrapeTweets

import puppeteer, { JSHandle } from "puppeteer"
import events from "events"
import { serverUrl } from "../config"
import { ScraperState, Tweet, User, Processable } from "./types"
import handleRequest from "../middleware/handleRequest"
import scrollPage from "../middleware/pageScroller"

export interface TweetsScraperConfig {
    keyword: string
    startDate: Date
    endDate: Date
}

function getInitialState(): ScraperState {
    return {
        loaded: false,
        data: {
            tweets: {},
            users: {}
        },
        processing: {
            tweets: {},
            users: {}
        },
        processed: {
            tweets: {},
            users: {}
        }
    }
}

async function scrapeTweets(config: TweetsScraperConfig) {
    const eventsEmitter = new events.EventEmitter()
    const state: ScraperState = getInitialState()

    const browser = await puppeteer.launch({
        executablePath:
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    })
    const page = await browser.newPage()

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
    page.on("requestfinished", req => handleRequest(req, state, eventsEmitter))

    await page.goto(pageUrl).catch()

    const bodyHandle = (await page.evaluateHandle(
        () => document.body
    )) as JSHandle<HTMLElement>

    eventsEmitter.on("loaded", () => {
        console.log("Ready")
        scrollPage(page, bodyHandle).then(val => {
            console.log("Close", val)
            browser.close()
        })
    })

    eventsEmitter.on(
        "process_tweets_and_users",
        (tweets: (Tweet & Processable)[], users: (User & Processable)[]) => {
            //console.log(tweets.length, users.length)
        }
    )
}

export default scrapeTweets

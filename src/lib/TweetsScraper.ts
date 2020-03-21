import puppeteer, { JSHandle } from "puppeteer"
import events from "events"
import { serverUrl } from "../config"
import { ScraperState, Tweet, User, Processable } from "./types"
import handleRequest from "../middleware/handleRequest"
import scrollPage from "../middleware/pageScroller"
import { chromePath } from "../systemConfig"
import worldCities from "../utils/worldCitiesParser"
import usStates from "../utils/statesParser"

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

// get data

async function scrapeTweets(config: TweetsScraperConfig) {
    const usData = await usStates
    const worldData = await worldCities
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        const eventsEmitter = new events.EventEmitter()
        const state: ScraperState = getInitialState()

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
        page.on("requestfinished", req =>
            handleRequest(req, state, eventsEmitter)
        )

        await page.goto(pageUrl).catch(err => reject(err))

        const bodyHandle = (await page.evaluateHandle(
            () => document.body
        )) as JSHandle<HTMLElement>

        eventsEmitter.on("loaded", () => {
            scrollPage(page, bodyHandle).then(val => {
                browser.close()
                resolve()
            })
        })

        eventsEmitter.on(
            "process_tweets_and_users",
            (
                tweets: (Tweet & Processable)[],
                users: (User & Processable)[]
            ) => {
                const count = tweets.reduce((sum, tweet) => {
                    if (tweet.user_id) {
                        // find the user id
                        const user = state.data.users[tweet.user_id]
                        if (!user || !user.location) return sum
                        const candidates = worldData.cities.filter(city => {
                            return (
                                user.location?.includes(city.country) ||
                                user.location?.includes(city.iso2)
                            )
                        })
                        console.log(user.location)

                        /*if (foundCity.country == "United States") {
                            const state = usData.lookup[foundCity.city_ascii]
                            if (state) {
                                console.log(
                                    state.city,
                                    state.state_id,
                                    user.location
                                )
                            }
                        }*/
                    }
                    return sum
                }, 0)
            }
        )
    })
}

export default scrapeTweets

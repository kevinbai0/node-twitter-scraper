import puppeteer from "puppeteer"
import {
    ResponseData,
    ScraperState,
    Tweet,
    Processable,
    User
} from "../lib/types"
import { EventEmitter } from "events"

export default async function handleRequest(
    req: puppeteer.Request,
    state: ScraperState,
    emitter: EventEmitter
) {
    const url = req.url()
    if (!url.includes("https://api.twitter.com/2/search/adaptive.json")) return
    const response = req.response()
    if (!response) return

    try {
        const data = (await response.json()) as ResponseData

        // save data to state
        Object.keys(data?.globalObjects?.tweets || {}).forEach(key => {
            if (state.data.tweets[key]) return // return if tweet was already processed
            if (data?.globalObjects?.tweets) {
                // save state to data and processing with a flag called waiting
                state.data.tweets[key] = data?.globalObjects?.tweets[key]
                state.processing.tweets[key] = {
                    ...data?.globalObjects?.tweets[key],
                    state: "waiting"
                }
            }
        })

        Object.keys(data?.globalObjects?.users || {}).forEach(key => {
            if (state.data.users[key]) return // return if user was already processed
            if (data?.globalObjects?.users) {
                state.data.users[key] = data?.globalObjects?.users[key]
                state.processing.users[key] = {
                    ...data?.globalObjects?.users[key],
                    state: "waiting"
                }
            }
        })

        processState(state, emitter)

        // once this finishes once, we can start scrolling
        if (!state.loaded) emitter.emit("loaded")
        state.loaded = true

        // output data
        const newKeys = Object.keys(data?.globalObjects?.tweets || [])
        let out: string | undefined = ""
        if (data?.globalObjects?.tweets) {
            out = data?.globalObjects?.tweets[newKeys[0]].created_at
        }
        console.log(Object.keys(state.data.tweets).length, out)
    } catch (err) {
        // do nothing
    }
}

/**
 * Takes processing tweets in state and starts processing the tweets that are in the waiting state
 * @param state
 * @param eventEmitter
 */
function processState(state: ScraperState, eventEmitter: EventEmitter) {
    function reduceProcessing<T>(
        accum: (T & Processable)[],
        key: string,
        data: { [key: string]: T & Processable }
    ) {
        const value = data[key]
        if (!value || value.state == "processing") return accum
        value.state = "processing" // update the state of the tweet so it doesn't get processed twice
        accum.push(value)
        return accum
    }

    const tweets = Object.keys(state.processing.tweets).reduce(
        (accum, key) =>
            reduceProcessing<Tweet>(accum, key, state.processing.tweets),
        new Array<Tweet & Processable>()
    )

    const users = Object.keys(state.processing.users).reduce(
        (accum, key) =>
            reduceProcessing<User>(accum, key, state.processing.users),
        new Array<User & Processable>()
    )

    // once we get tweets and users to process, create an event
    eventEmitter.emit("process_tweets_and_users", tweets, users)
}

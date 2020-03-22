import { ResponseData, Tweet, User } from "../../lib/types"
import { AppState, Processable, ProcessableTweet } from "../types"

export default async function handleRequest(
    data: ResponseData,
    state: AppState
) {
    // save data to state
    Object.keys(data?.globalObjects?.tweets || {}).forEach(key => {
        if (state.data.tweets[key]) return // return if tweet was already processed
        if (data?.globalObjects?.tweets) {
            // save state to data and processing with a flag called waiting
            state.data.tweets[key] = data?.globalObjects?.tweets[key]
            state.queue.tweets[key] = {
                ...data?.globalObjects?.tweets[key],
                state: "waiting"
            }
        }
    })

    Object.keys(data?.globalObjects?.users || {}).forEach(key => {
        if (state.data.users[key]) return // return if user was already processed
        if (data?.globalObjects?.users) {
            state.data.users[key] = data?.globalObjects?.users[key]
            state.queue.users[key] = {
                ...data?.globalObjects?.users[key],
                state: "waiting"
            }
        }
    })
    const dataToProcess = processState(state)

    // output data
    printData(state, dataToProcess.tweets)

    return dataToProcess
}

/**
 * Takes processing tweets in state and starts processing the tweets that are in the waiting state
 * @param state
 * @param eventEmitter
 */
function processState(state: AppState) {
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

    const tweets = Object.keys(state.queue.tweets).reduce(
        (accum, key) => reduceProcessing<Tweet>(accum, key, state.queue.tweets),
        new Array<Tweet & Processable>()
    )

    const users = Object.keys(state.queue.users).reduce(
        (accum, key) => reduceProcessing<User>(accum, key, state.queue.users),
        new Array<User & Processable>()
    )

    // these are the tweets we want to send to the database
    return {
        users,
        tweets
    }
}

function printData(state: AppState, tweets: ProcessableTweet[]) {
    let out: string | undefined = ""
    if (tweets.length > 0) {
        out = tweets[0].created_at
    }
    console.log(Object.keys(state.data.tweets).length, out)
}

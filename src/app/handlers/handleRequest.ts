import { ResponseData, User } from "../../lib/types"
import { AppState, LocatedTweet } from "../types"

export default async function handleRequest(
    data: ResponseData,
    state: AppState
) {
    const locatedTweets: LocatedTweet[] = []
    const users: User[] = []
    // save data to state
    Object.keys(data?.globalObjects?.tweets || {}).forEach(key => {
        if (state.data.tweets[key]) return // return if tweet was already processed
        if (data?.globalObjects?.tweets) {
            const tweet: LocatedTweet = {
                ...data?.globalObjects?.tweets[key],
                hasLocation: false
            }
            state.data.tweets[key] = tweet
            locatedTweets.push({ ...tweet })
        }
    })

    Object.keys(data?.globalObjects?.users || {}).forEach(key => {
        if (state.data.users[key]) return // return if user was already processed
        if (data?.globalObjects?.users) {
            state.data.users[key] = data?.globalObjects?.users[key]
            users.push(data?.globalObjects?.users[key])
        }
    })
    // output data
    printData(state, locatedTweets)

    return {
        tweets: locatedTweets,
        users
    }
}

function printData(state: AppState, tweets: LocatedTweet[]) {
    if (tweets.length > 0) {
        console.log(Object.keys(state.data.tweets).length, tweets[0].created_at)
    }
}

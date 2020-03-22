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
        if (data?.globalObjects?.tweets) {
            const tweet: LocatedTweet = {
                ...data?.globalObjects?.tweets[key],
                hasLocation: false
            }
            locatedTweets.push({ ...tweet })
        }
    })

    Object.keys(data?.globalObjects?.users || {}).forEach(key => {
        if (data?.globalObjects?.users) {
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
        state.count += tweets.length
        console.log(state.count, tweets[0].created_at)
    }
}

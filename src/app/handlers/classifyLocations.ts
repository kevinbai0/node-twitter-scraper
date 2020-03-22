import { User } from "../../lib/types"
import entityMatcher from "../locationClassifier/entityMatcher"
import { LocatedTweet, AppState } from "../types"
import { Entities } from "../preprocessing/types"
import { CityPopulation } from "../utils/populations"
import db from "../db"

type Data = {
    tweets: LocatedTweet[]
    users: User[]
}
type Pop = {
    [key: string]: CityPopulation[]
}

type ReturnType = {
    tweets: LocatedTweet[]
    users: User[]
}

type Fn = (
    data: Data,
    state: AppState,
    entities: Entities,
    populationsLookup: Pop
) => Promise<ReturnType>

const classifyLocations: Fn = async (
    data,
    state,
    entities,
    populationsLookup
) => {
    const { tweets, users } = data
    const collection = db
        .then(database => database?.collection("twitter_accounts"))
        .catch(() => {
            // do nothing
        })
    const newTweets: LocatedTweet[] = await Promise.all(
        tweets.map(async tweet => {
            if (!tweet.user_id) return tweet
            if (!collection) return tweet
            const cln = await collection
            if (!cln) return tweet
            const user: User | null = await cln.findOne({
                id_str: tweet.user_id_str
            })
            if (!user || !user.location) return tweet

            const foundLocation = entityMatcher(
                user.location,
                entities,
                populationsLookup
            )

            return {
                ...tweet,
                location: foundLocation,
                hasLocation: !!foundLocation,
                userLocation: user.location
            }
        })
    )

    return {
        tweets: newTweets,
        users
    }
}

export default classifyLocations

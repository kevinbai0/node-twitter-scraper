import { User } from "../../lib/types"
import entityMatcher from "../locationClassifier/entityMatcher"
import { LocatedTweet, AppState } from "../types"
import { Entities } from "../preprocessing/types"
import { CityPopulation } from "../utils/populations"

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
) => ReturnType

const classifyLocations: Fn = (data, state, entities, populationsLookup) => {
    const { tweets, users } = data
    const newTweets: LocatedTweet[] = tweets.map(tweet => {
        if (!tweet.user_id) return tweet

        const user = state.data.users[tweet.user_id]
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

    return {
        tweets: newTweets,
        users
    }
}

export default classifyLocations

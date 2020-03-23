import { User, Users } from "../../lib/types"
import entityMatcher from "../locationClassifier/entityMatcher"
import { LocatedTweet } from "../types"
import { Entities } from "../preprocessing/types"
import { CityPopulation } from "../utils/populations"

type Data = {
    tweets: LocatedTweet[]
    users: User[]
    lookupUsers?: Users
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
    entities: Entities,
    populationsLookup: Pop
) => Promise<ReturnType>

const classifyLocations: Fn = async (data, entities, populationsLookup) => {
    const { tweets, users, lookupUsers } = data

    const newTweets: LocatedTweet[] = tweets.map(tweet => {
        if (!tweet.user_id_str || !lookupUsers) return tweet
        const user = lookupUsers[tweet.user_id_str]
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

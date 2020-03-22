import { Tweet, User } from "../../lib/types"
import entityMatcher from "../locationClassifier/entityMatcher"
import { LocatedTweet } from "../types"
import { Entities } from "../preprocessing/types"
import { CityPopulation } from "../utils/populations"

type Data = {
    tweets: Tweet[]
    users: User[]
}
type Pop = {
    [key: string]: CityPopulation[]
}

type ReturnType = {
    tweets: LocatedTweet[]
    users: User[]
}

type Fn = (data: Data, entities: Entities, populationsLookup: Pop) => ReturnType

const classifyLocations: Fn = (data, entities, populationsLookup) => {
    const { tweets, users } = data
    const newTweets: LocatedTweet[] = tweets.map(tweet => {
        if (!tweet.user_id) return tweet

        const user = users[tweet.user_id]
        if (!user || !user.location) return tweet

        const foundLocation = entityMatcher(
            user.location,
            entities,
            populationsLookup
        )

        return {
            ...tweet,
            location: foundLocation
        }
    })

    return {
        tweets: newTweets,
        users
    }
}

export default classifyLocations

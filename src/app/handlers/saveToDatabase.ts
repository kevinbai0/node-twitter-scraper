import { User } from "../../lib/types"
import { LocatedTweet } from "../types"
import { Db } from "mongodb"

type Data = {
    tweets: LocatedTweet[]
    users: User[]
}

type Fn = (data: Data, db: Db) => Promise<void>

const saveToDatabase: Fn = async (data, db) => {
    const { tweets, users } = data

    const tweetsCollection = db.collection("tweets")
    const usersCollection = db.collection("twitter_accounts")

    if (tweets.length > 0) {
        try {
            await tweetsCollection.insertMany(tweets)
        } catch (err) {
            // each error only means
        }
    }
    if (users.length > 0) {
        try {
            await usersCollection.insertMany(users)
        } catch (err) {
            // do nothing
        }
    }
}

export default saveToDatabase

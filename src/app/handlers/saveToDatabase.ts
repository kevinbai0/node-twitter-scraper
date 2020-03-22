import { User } from "../../lib/types"
import { AppState, LocatedTweet } from "../types"
import { Db } from "mongodb"

type Data = {
    tweets: LocatedTweet[]
    users: User[]
}

type Fn = (data: Data, state: AppState, db: Db) => Promise<void>

const saveToDatabase: Fn = async (data, state, db) => {
    // do nothing
}

export default saveToDatabase

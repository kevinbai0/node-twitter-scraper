import { Tweet, User } from "../lib/types"

export interface TweetsObj {
    tweets: { [key: string]: LocatedTweet }
    users: { [key: string]: User }
}

export interface AppState {
    data: TweetsObj
}

export interface LocationData {
    country: string
    region?: string
    city?: string
}

export type LocatedTweet = Tweet & {
    location?: LocationData
    userLocation?: string
    hasLocation: boolean
}

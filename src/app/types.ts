import { Tweet, User } from "../lib/types"

export interface Processable {
    state: "waiting" | "processing"
}

export interface TweetsObj<T> {
    tweets: { [key: string]: Tweet & T }
    users: { [key: string]: User & T }
}

export interface AppState {
    data: TweetsObj<{}>
    queue: TweetsObj<Processable>
}

export type ProcessableTweet = Tweet & Processable
export type ProcessableUser = Tweet & User

export interface LocationData {
    country: string
    region?: string
    city?: string
}

export type LocatedTweet = Tweet & { location?: LocationData }

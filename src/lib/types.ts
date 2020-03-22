export interface Tweet {
    created_at?: string
    id?: number
    id_str?: string
    full_text?: string
    truncated?: boolean
    display_text_range?: [number, number]
    user_id?: number
    user_id_str?: string
    retweet_count?: number
    favourite_count?: number
    reply_count?: number
}

export interface User {
    id?: number
    id_str?: string
    name?: string
    screen_name?: string
    location?: string
    description?: string
    followers_count?: string
}

export type Tweets = {
    [key: string]: Tweet
}

export type Users = {
    [key: string]: User
}

export interface ResponseData {
    globalObjects?: {
        tweets?: Tweets
        users?: Users
    }
}

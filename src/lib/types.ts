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

export interface ResponseData {
    globalObjects?: {
        tweets?: { [key: string]: Tweet }
        users?: { [key: string]: User }
    }
}

export interface Processable {
    state: "waiting" | "processing"
}

export interface TweetsObj<T> {
    tweets: { [key: string]: Tweet & T }
    users: { [key: string]: User & T }
}

export interface ScraperState {
    loaded: boolean
    data: TweetsObj<{}>
    processing: TweetsObj<Processable>
}

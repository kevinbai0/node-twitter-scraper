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
    favorite_count?: number
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

interface OperationCursor {
    cursor?: {
        value?: string
        cursorType?: "Top" | "Bottom"
    }
}

export interface AddEntry {
    addEntries?: {
        entries?: {
            entryId?: string
            sortIndex?: string
            content?: {
                item?: object
                operation?: OperationCursor
            }
        }[]
    }
}

export interface ReplaceEntry {
    replaceEntry?: {
        entryIdToReplace?: string
        entry?: {
            entryId?: string
            sortIndex?: string
            content?: {
                operation?: OperationCursor
            }
        }
    }
}

export interface ResponseData {
    globalObjects?: {
        tweets?: Tweets
        users?: Users
    }
    timeline?: {
        instructions?: (AddEntry | ReplaceEntry)[]
    }
}

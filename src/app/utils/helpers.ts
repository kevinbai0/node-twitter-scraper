import { AppState } from "../types"

export function tomorrow(today: Date) {
    const next = new Date(today)
    next.setDate(next.getDate() + 1)
    return next
}

export function getInitialState(): AppState {
    return {
        count: 0
    }
}

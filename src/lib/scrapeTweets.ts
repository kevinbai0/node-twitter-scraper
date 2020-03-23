import puppeteer from "puppeteer"
import { serverUrl } from "../config"
import { ResponseData, AddEntry, ReplaceEntry } from "./types"
import fetch from "node-fetch"

export interface TweetsScraperConfig {
    keyword: string
    startDate: Date
    endDate: Date
}

async function scrapeTweets(
    config: TweetsScraperConfig,
    handleData: (data: ResponseData) => void
) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        let visited = false

        const browser = await puppeteer.launch({
            executablePath: process.env.CHROME_PATH
        })
        const page = await browser.newPage()
        page.setDefaultNavigationTimeout(0)

        // parse config file
        const { searchKeyword, endDate, startDate } = (() => {
            return {
                searchKeyword: config.keyword.split(" ").join("+"),
                endDate: config.endDate.toISOString().slice(0, 10),
                startDate: config.startDate.toISOString().slice(0, 10)
            }
        })()

        const pageUrl = `${serverUrl}/search?q=${searchKeyword}+until%3A${endDate}+since%3A${startDate}`
        page.setRequestInterception(true)

        page.on("request", async req =>
            req.continue({
                url: req.url().replace("count=20", "count=200")
            })
        )

        page.on("requestfinished", async req => {
            const url = req.url()
            if (!url.includes("https://api.twitter.com/2/search/adaptive.json"))
                return
            const response = req.response()
            if (!response) return

            try {
                const data = (await response.json().catch(() => {
                    // do nothing
                })) as ResponseData
                if (!data || visited) return
                visited = true
                handleResponse(data, req)
            } catch (err) {
                console.error(err)
            }
        })

        await page.goto(pageUrl).catch(err => {
            console.log("couldn't go to page: ", pageUrl)
            reject(err)
        })
        function handleResponse(data: ResponseData, req: puppeteer.Request) {
            handleData(data)
            const initialHeaders = req.headers()
            const initialUrl = req.url().replace("count=20", "count=200")
            let count = 0
            let prevCount = -1
            let newData = data
            let prevCursor = ""
            const interval = setInterval(async () => {
                if (count == prevCount) return
                prevCount += 1
                const result = await fetchApi(
                    initialHeaders,
                    initialUrl,
                    newData
                )
                count += 1
                if (!result || result.cursor == prevCursor) {
                    clearInterval(interval)
                    resolve()
                    return
                }
                handleData(result.data)
                newData = result.data
                prevCursor = result.cursor || ""
            }, 50)
        }

        async function fetchApi(
            headers: puppeteer.Headers,
            url: string,
            data: ResponseData
        ) {
            const cursor = getCursor(data)
            const newUrl = getUrl(url, cursor)
            if (!newUrl) return
            const json: ResponseData = await fetch(
                newUrl.replace("count=20", "count=200"),
                { headers }
            )
                .then(res => res.json())
                .catch(err => {
                    console.error(err)
                    resolve()
                })
            return {
                data: json,
                cursor: cursor
            }
        }
    })
}

export default scrapeTweets

function getUrl(url: string, cursor?: string) {
    if (!cursor) return
    const newUrl = url.concat(`&cursor=${cursor}`)

    return newUrl
}

function getCursor(data: ResponseData) {
    const instructions = data.timeline?.instructions
    if (!instructions?.length) return
    if (instructions.length == 1) {
        const entry = instructions[0] as AddEntry
        const entries =
            entry.addEntries?.entries &&
            entry.addEntries.entries.filter(
                entry => entry.entryId == "sq-cursor-bottom"
            )
        if (!entries || !entries.length) return
        const foundEntry = entries[0]
        if (foundEntry.content?.operation?.cursor?.cursorType != "Bottom")
            return
        return foundEntry.content?.operation?.cursor?.value
    }
    if (instructions.length < 3) return
    const entry = instructions[2] as ReplaceEntry
    if (
        entry.replaceEntry?.entry?.content?.operation?.cursor?.cursorType !=
        "Bottom"
    ) {
        return
    }
    return entry.replaceEntry?.entry?.content?.operation?.cursor?.value
}

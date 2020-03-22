import scrapeTweets from "../lib/scrapeTweets"
import { ResponseData } from "../lib/types"
import db from "./db"
import { entitiesPromise, populations, state } from "../app/setup"
import { tomorrow } from "./utils/helpers"
import handleRequest from "./handlers/handleRequest"
import saveToDatabase from "./handlers/saveToDatabase"
import classifyLocations from "./handlers/classifyLocations"
import { performance } from "perf_hooks"

async function scrapeAllDays() {
    const time = performance.now()
    const entities = await entitiesPromise
    const populationsLookup = await populations
    const database = await db

    if (!database) {
        console.log("Couldn't connect to database")
        return
    }

    try {
        // remove duplicates
        /*const duplicates: unknown[] = []
        await database
            .collection("tweets")
            .aggregate([
                {
                    $group: {
                        _id: "$id_str",
                        dups: { $addToSet: "$_id" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        count: { $gt: 1 }
                    }
                }
            ])
            .forEach(doc => {
                doc.dups.shift() // First element skipped for deleting
                doc.dups.forEach(function(dupId) {
                    duplicates.push(dupId)
                })
            })
        console.log(duplicates.length)*/
        //database.collection("tweets").deleteMany({ _id: { $in: duplicates } })

        await database
            .collection("tweets")
            .createIndex({ id_str: "text" }, { unique: true })
        await database
            .collection("twitter_accounts")
            .createIndex({ id_str: "text" }, { unique: true })
    } catch (err) {
        console.error(err)
        process.exit(1)
    }

    const startDate = new Date("2020-01-01")
    let currentDate = new Date(startDate)

    async function onData(data: ResponseData) {
        const dataToProcess = await handleRequest(data, state)
        const classifiedData = await classifyLocations(
            dataToProcess,
            state,
            entities,
            populationsLookup
        )

        saveToDatabase(classifiedData, database!)
    }

    async function scrapeDay(date: Date): Promise<unknown> {
        if (date.getTime() > new Date("2020-01-18").getTime()) {
            console.log("Finished scraping")
            return
        }
        console.log("Scraping", date)
        try {
            currentDate = tomorrow(currentDate)
            await scrapeTweets(
                {
                    keyword: "coronavirus",
                    startDate: date,
                    endDate: tomorrow(date)
                },
                onData
            )
            console.log("Finished", date)
            return scrapeDay(currentDate)
        } catch (err) {
            console.log("Failed on day ", date)
            console.log(err)
        }
    }

    await Promise.all([
        scrapeDay(currentDate),
        scrapeDay(currentDate),
        scrapeDay(currentDate),
        scrapeDay(currentDate),
        scrapeDay(currentDate)
    ])
    const end = performance.now()
    const duration = end - time
    const hours = Math.floor(duration / 1000 / 60 / 60)
    const minutes = Math.floor(duration / 1000 / 60) % 60
    const seconds = Math.floor(duration / 1000) % 60
    console.log(
        "\x1b[36m%s",
        `Scraped from ${startDate.toDateString()} to ${currentDate.toDateString()} in ${hours}h ${minutes}m ${seconds}s`
    )
    process.exit(0)
}

scrapeAllDays()

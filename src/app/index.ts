import scrapeTweets from "../lib/scrapeTweets"
import { ResponseData } from "../lib/types"
import db from "./db"
import { entitiesPromise, populations, state } from "../app/setup"
import { tomorrow } from "./utils/helpers"
import handleRequest from "./handlers/handleRequest"
import saveToDatabase from "./handlers/saveToDatabase"
import classifyLocations from "./handlers/classifyLocations"

async function scrapeAllDays() {
    const entities = await entitiesPromise
    const populationsLookup = await populations
    const database = await db

    if (!database) {
        console.log("Couldn't connect to database")
        return
    }

    let currentDate = new Date("2020-03-15")

    async function onData(data: ResponseData) {
        const dataToProcess = await handleRequest(data, state)
        const classifiedData = classifyLocations(
            dataToProcess,
            state,
            entities,
            populationsLookup
        )

        saveToDatabase(classifiedData, database!)
    }

    function scrapeDay(date: Date) {
        console.log("Scraping", date)
        const returnValue = scrapeTweets(
            {
                keyword: "coronavirus",
                startDate: date,
                endDate: tomorrow(date)
            },
            onData
        )
            .then(() => {
                console.log("Finished", date)
                scrapeDay(currentDate)
            })
            .catch(err => {
                console.log("Failed on day ", date)
                console.log(err)
            })
        currentDate = tomorrow(currentDate)
        return returnValue
    }

    scrapeDay(currentDate)
    scrapeDay(currentDate)
    scrapeDay(currentDate)
    scrapeDay(currentDate)
    scrapeDay(currentDate)
}

scrapeAllDays()

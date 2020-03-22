import scrapeTweets from "./lib/TweetsScraper"
import db from "./db"

db.then(database => {
    if (!database) return
})

function tomorrow(today: Date) {
    const next = new Date(today)
    next.setDate(next.getDate() + 1)
    return next
}

function scrapeAllDays() {
    let currentDate = new Date("2020-01-01")

    function scrapeDay(date: Date) {
        const returnValue = scrapeTweets({
            keyword: "coronavirus",
            startDate: date,
            endDate: tomorrow(date)
        })
            .then(() => {
                console.log("FINISHED SCRAPING", date)
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

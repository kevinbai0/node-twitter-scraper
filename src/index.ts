import scrapeTweets from "./lib/TweetsScraper"

scrapeTweets({
    keyword: "coronavirus",
    startDate: new Date("2020-01-10"),
    endDate: new Date("2020-01-11")
})

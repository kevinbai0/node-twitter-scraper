import scrapeTweets from "./TweetsScraper"

scrapeTweets({
    keyword: "coronavirus",
    startDate: new Date("2020-03-10"),
    endDate: new Date("2020-03-11")
})

import fs from "fs"

let text = ""
const stream = fs.createReadStream(
    "/Users/kevinbai/Programming/twitter-scraper/src/City.json"
)
stream
    .on("data", data => {
        text += data
    })
    .on("end", () => {
        const json = JSON.parse(text)
        console.log(json.results.length)
    })

export default text

import fs from "fs"
import { normalizeString } from "../preprocessing/helpers"

export interface CityPopulation {
    city: string
    country: string
    population: number
}

function readCSV(path: string, lineDelimiter = "\n"): Promise<string[][]> {
    return new Promise((res, rej) => {
        let text = ""
        fs.createReadStream(path)
            .on("data", (data: Buffer) => (text += data))
            .on("end", () => {
                const data = text.split(lineDelimiter).map(line =>
                    line.split('","').map((str, i) => {
                        if (i == 0) return str.slice(1)
                        if (i == line.length - 1) return str.slice(-1)
                        return str
                    })
                )
                res(data)
            })
            .on("error", err => {
                console.error(err)
                rej(err)
            })
    })
}

export default async function extractPopulations() {
    const data = await readCSV(
        "/home/kevin/Programming/twitter-scraper/src/app/data/worldcities.csv",
        "\r\n"
    )

    const lookup: { [key: string]: CityPopulation[] } = {}
    data.forEach(row => {
        const city = normalizeString(row[1])
        const data = {
            city: normalizeString(row[1]),
            country: normalizeString(row[4]),
            population: parseInt(row[9])
        }
        if (lookup[city]) lookup[city].push(data)
        else lookup[city] = [data]
    })

    return lookup
}

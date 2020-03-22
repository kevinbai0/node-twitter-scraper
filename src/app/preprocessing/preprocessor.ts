import fs from "fs"
import { getCountriesLookup, getRegions, getCitiesLookup } from "./parseData"
import createEntities from "./createEntities"

// execute main function
main()

async function main() {
    const countries = await getCountriesLookup()
    const regions = await getRegions(countries.lookup)
    const cities = await getCitiesLookup(countries.lookup, regions.lookupById)

    // create entities
    const entities = createEntities(
        cities.iterable,
        regions.iterable,
        countries.iterable
    )
    // hardcode some values
    // Washington DC
    entities["dc"].complete.push({
        isAbbr: false,
        obj: cities.lookup["washington dc"][0]
    })
    entities["nyc"] = {
        partial: [],
        complete: [
            {
                isAbbr: false,
                obj: cities.lookup["new york city"][0]
            }
        ]
    }
    entities["us"].complete.push({
        isAbbr: false,
        obj: countries.lookup["united states"]
    })
    entities["usa"].complete.push({
        isAbbr: false,
        obj: countries.lookup["united states"]
    })

    entities["uk"].complete.push({
        isAbbr: false,
        obj: countries.lookup["united kingdom"]
    })

    // save entities
    const writer = fs.createWriteStream(
        "/users/kevinbai/Programming/twitter-scraper/src/app/data/entities.json"
    )
    writer.write(JSON.stringify(entities), err => {
        if (err) console.error(err)
        writer.close()
    })
}

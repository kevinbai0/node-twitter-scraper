import fs from "fs"
import {
    JSONCountryData,
    JSONRegionData,
    Region,
    generateCountry,
    generateRegion,
    Countries,
    Regions,
    Cities,
    readStream,
    JSONCityData,
    generateCity,
    RegionsById,
    Country,
    City
} from "./preprocessHelpers"
import { performance } from "perf_hooks"

async function getCountriesLookup(): Promise<{
    lookup: Countries
    iterable: Country[]
}> {
    const countriesLookup: Countries = {}

    const data = await readStream<JSONCountryData[]>(
        "/Users/kevinbai/Programming/twitter-scraper/src/data/Countries.json"
    )
    const iterable = data.map(value => {
        const country = generateCountry(value)
        countriesLookup[country.name] = country
        countriesLookup[country.iso2] = country
        countriesLookup[country.iso3] = country
        return country
    })

    return { lookup: countriesLookup, iterable }
}

async function getRegions(
    countriesLookup: Countries
): Promise<{
    lookupById: RegionsById
    lookup: Regions
    lookupByCode: Regions
    iterable: Region[]
}> {
    const regionsLookup: Regions = {}
    const lookupById: RegionsById = {}
    const lookupByCode: Regions = {}
    const data = await readStream<JSONRegionData[]>(
        "/Users/kevinbai/Programming/twitter-scraper/src/data/States.json"
    )

    const iterable = data.map(value => {
        const region = generateRegion(value, countriesLookup)
        lookupById[region.id] = region
        if (regionsLookup[region.name]) regionsLookup[region.name].push(region)
        else regionsLookup[region.name] = [region]

        if (lookupByCode[region.abbr]) lookupByCode[region.abbr].push(region)
        else lookupByCode[region.abbr] = [region]

        return region
    })

    return { lookup: regionsLookup, lookupById, iterable, lookupByCode }
}

async function getCitiesLookup(
    countriesLookup: Countries,
    regions: RegionsById
): Promise<{ lookup: Cities; iterable: City[] }> {
    const citiesLookup: Cities = {}
    const data = await readStream<JSONCityData[]>(
        "/Users/kevinbai/Programming/twitter-scraper/src/data/Cities.json"
    )
    const iterable = data.map(value => {
        const city = generateCity(value, countriesLookup, regions)
        if (citiesLookup[city.name]) {
            citiesLookup[city.name].push(city)
            return city
        }
        citiesLookup[city.name] = [city]
        return city
    })
    return { lookup: citiesLookup, iterable }
}

function createEntities(
    cities: City[],
    regions: Region[],
    countries: Country[]
) {
    const entities: {
        [key: string]: {
            partial: { isAbbr: boolean; obj: City | Region | Country }[]
            complete: { isAbbr: boolean; obj: City | Region | Country }[]
        }
    } = {}

    function mapEntities(
        values: string[],
        obj: City | Region | Country,
        isAbbr: boolean
    ) {
        if (values.length > 1) {
            values.forEach(value => {
                if (entities[value]) {
                    entities[value] = {
                        ...entities[value],
                        partial: [...entities[value].partial, { isAbbr, obj }]
                    }
                    return
                }
                entities[value] = {
                    partial: [{ isAbbr, obj }],
                    complete: []
                }
            })
            return
        }
        if (entities[values[0]]) {
            const value = entities[values[0]]
            entities[values[0]] = {
                ...value,
                complete: [...value.complete, { isAbbr, obj }]
            }
            return
        }
        entities[values[0]] = { partial: [], complete: [{ isAbbr, obj }] }
    }

    cities.forEach(city => {
        mapEntities(city.name.split(" "), city, false)
    })
    countries.forEach(country => {
        mapEntities(country.name.split(" "), country, false)
        mapEntities([country.iso2], country, true)
        mapEntities([country.iso3], country, true)
    })

    regions.forEach(region => {
        mapEntities(region.name.split(" "), region, false)
        mapEntities([region.abbr], region, true)
    })

    return entities
}

async function main() {
    const start = performance.now()
    const countries = await getCountriesLookup()
    const regions = await getRegions(countries.lookup)
    const cities = await getCitiesLookup(countries.lookup, regions.lookupById)

    // create entities
    const entities = createEntities(
        cities.iterable,
        regions.iterable,
        countries.iterable
    )

    // save entities
    const writer = fs.createWriteStream(
        "/Users/kevinbai/Programming/twitter-scraper/src/data/entities.json"
    )
    writer.write(JSON.stringify(entities), err => {
        if (err) console.error(err)
        writer.close()
    })
}

main()

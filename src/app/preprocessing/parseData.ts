import {
    Countries,
    Country,
    JSONCountryData,
    RegionsById,
    Regions,
    Region,
    JSONRegionData,
    JSONCityData,
    Cities,
    City
} from "./types"
import {
    readStream,
    generateCountry,
    generateRegion,
    generateCity
} from "./helpers"

export async function getCountriesLookup(): Promise<{
    lookup: Countries
    iterable: Country[]
}> {
    const countriesLookup: Countries = {}

    const data = await readStream<JSONCountryData[]>(
        "/users/kevinbai/Programming/twitter-scraper/src/app/data/Countries.json"
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

export async function getRegions(
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
        "/users/kevinbai/Programming/twitter-scraper/src/app/data/States.json"
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

export async function getCitiesLookup(
    countriesLookup: Countries,
    regions: RegionsById
): Promise<{ lookup: Cities; iterable: City[] }> {
    const citiesLookup: Cities = {}
    const data = await readStream<JSONCityData[]>(
        "/users/kevinbai/Programming/twitter-scraper/src/app/data/Cities.json"
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

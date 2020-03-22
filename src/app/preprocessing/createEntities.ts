import { City, Region, Country, Entities, Location } from "./types"

export default function createEntities(
    cities: City[],
    regions: Region[],
    countries: Country[]
) {
    const entities: Entities = {}

    function mapEntities(values: string[], obj: Location, isAbbr: boolean) {
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
    })

    regions.forEach(region => {
        mapEntities(region.name.split(" "), region, false)
        mapEntities([region.abbr], region, true)
    })

    return entities
}

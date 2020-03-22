import {
    Entities,
    Entity,
    Location,
    City,
    Region,
    Country
} from "../preprocessing/types"
import { CityPopulation } from "../utils/populations"
import { normalizeString } from "../preprocessing/helpers"
import { LocationData } from "../types"

export default function(
    value: string,
    entities: Entities,
    populationsLookup: { [key: string]: CityPopulation[] }
): LocationData | undefined {
    const extractedEntities = value
        .split(" ")
        .map(candidate => {
            const normalized = normalizeString(candidate).replace(
                /[^a-z\d ]+/i,
                ""
            )
            return {
                key: normalized,
                entity: entities[normalized]
            }
        })
        .reduce((accum, entity, i) => {
            const last = accum.length - 1
            if (i == 0 && !entity.entity) return accum
            if (!entity.entity && accum.length == 0) {
                accum.push([])
                return accum
            }
            if (!entity.entity && accum[last].length == 0) return accum
            if (!entity.entity) {
                accum.push([])
                return accum
            }
            if (accum.length == 0) accum.push([entity])
            else accum[last].push(entity)

            return accum
        }, new Array<{ key: string; entity: Entity }[]>())

    if (
        extractedEntities.length > 0 &&
        extractedEntities[extractedEntities.length - 1].length == 0
    ) {
        extractedEntities.pop()
    }

    // combine any partial entities, get lists of all full entities
    const fullEntities = extractedEntities.map(entitySet => {
        const newEntities: Location[][] = []

        for (let i = 1; i <= entitySet.length; ++i) {
            const prev = entitySet[i - 1]
            if (i == entitySet.length) {
                newEntities.push(prev.entity.complete.map(comp => comp.obj))
                break
            }
            const curr = entitySet[i]
            const matched = matchPartial(prev, curr)
            if (matched.length) {
                // if we've matched a full entity, we want to skip the current as the prev
                newEntities.push(matched)
                ++i
            }
            // look at prev and see if it is full
            else {
                newEntities.push(prev.entity.complete.map(comp => comp.obj))
            }
        }
        // get rid of any empty sets
        return newEntities.filter(data => data.length)
    })
    // cross examine full entities and find one that matches, if none match, there are none
    const subMatrix = fullEntities.map(matrix => linkVectors(matrix))
    const finalCandidates = linkVectors(subMatrix)

    // if we found more than 1 potential match, we got an ambiguous case so we don't count
    if (finalCandidates.length == 0) {
        return undefined
    }
    if (finalCandidates.length == 1)
        return extractLocationData(finalCandidates[0])

    const country = finalCandidates.filter(
        candidate => (candidate as Country).iso2
    )
    if (country.length > 0) return extractLocationData(country[0])

    const candidatesWithPop = finalCandidates.reduce((accum, candidate) => {
        const locData = extractLocationData(candidate)
        if (locData.city) {
            const withPopulations = populationsLookup[locData.city]
            if (!withPopulations) return accum

            for (const withPopulation of withPopulations) {
                if (!withPopulation) continue
                if (withPopulation.country == locData.country) {
                    accum.push({ ...candidate, pop: withPopulation.population })
                }
            }
        }
        return accum
    }, new Array<Location & { pop: number }>())

    candidatesWithPop.sort((a, b) => b.pop - a.pop)
    if (!candidatesWithPop.length) return
    return extractLocationData(candidatesWithPop[0])
}

function linkVectors(matrix: Location[][]): Location[] {
    if (matrix.length == 0) return []
    if (matrix.length == 1) return matrix[0]

    //initialize location matrix with -1, locationMatrix (not NxM)
    /** example
     * -1 -1 -1
     * -1 -1
     * -1 -1 -1 -1
     * ...
     */

    const locationMatrix: (Location | undefined)[][] = matrix.map(vector =>
        vector.map(() => undefined)
    )

    // initialize the first row of the location matrix
    /**
     *  0  1  2
     * -1 -1
     * -1 -1 -1 -1
     */
    matrix[0].forEach((loc, i) => (locationMatrix[0][i] = loc))

    for (let i = 1; i < matrix.length; ++i) {
        const prevVector = matrix[i - 1]
        const currVector = matrix[i]

        let flag = false
        prevVector.forEach((entity, j) => {
            // if the entity didn't have a match, no point of finding further matches
            if (!locationMatrix[i - 1][j]) return
            flag = true
            // if there was a match in the prev column we can find matches in the current vector
            currVector.forEach((currEntity, index) => {
                if (!matches(currEntity, entity)) return
                locationMatrix[i][index] = mostSpecificLocation(
                    locationMatrix[i - 1][j]!,
                    currEntity
                )
            })
        })
        // if no successful match, we don't have a location and we can early return
        if (!flag) return []
    }

    // last row of locationMatrix contains what we want
    return locationMatrix[locationMatrix.length - 1].filter(
        loc => !!loc
    ) as Location[]
}

function matchPartial(
    a: { key: string; entity: Entity },
    b: { key: string; entity: Entity }
) {
    const combined = `${a.key} ${b.key}`
    return a.entity.partial
        .filter(partial => partial.obj.name == combined)
        .map(partial => partial.obj)
}

function matches(locationA: Location, locationB: Location): boolean {
    const a = extractLocationData(locationA)
    const b = extractLocationData(locationB)

    if (a.country != b.country) return false
    if (a.region && b.region && a.region != b.region) return false
    if (a.city && b.city && a.city != b.city) return false
    return true
}

function mostSpecificLocation(a: Location, b: Location) {
    if ((a as City).regionCode) return a
    if ((b as City).regionCode) return b
    if ((a as Region).abbr) return a
    if ((b as Region).abbr) return b
    return a || b
}

function extractLocationData(loc: Location): LocationData {
    if ((loc as City).regionCode) {
        const city = loc as City
        return {
            country: city.country,
            region: city.region,
            city: city.name
        }
    }
    if ((loc as Region).abbr) {
        const region = loc as Region
        return {
            country: region.country,
            region: region.name
        }
    }
    const country = loc as Country
    return {
        country: country.name
    }
}

/*export function locationToString(location: Location) {
    const info = extractLocationData(location)
    if (!info.city && !info.region) return info.country
    if (info.city && info.region)
        return `${info.city}, ${info.region}, ${info.country}`
    return `${info.city || info.region}, ${info.country}`
}
*/

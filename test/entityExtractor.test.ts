import entityMatcher, {
    locationToString
} from "../src/app/locationClassifier/entityMatcher"
import { readStream } from "../src/app/preprocessing/helpers"
import extractPopulations from "../src/app/utils/populations"
import { Entities } from "../src/app/preprocessing/types"

it("entities", async () => {
    const entities = await readStream<Entities>(
        (process.env.DIR_PATH || ".") + "/src/app/data/entities.json"
    )
    const populations = await extractPopulations()

    const tests = [
        ["New York, NY", "new york, united states"],
        ["Thunder Bay, ON", "thunder bay, ontario, canada"],
        ["New oajf ojasioj York", ""],
        ["Houston, TX", "houston, texas, united states"],
        ["Atlanta, GA", "atlanta, georgia, united states"],
        ["Madrid", "madrid, community of madrid, spain"],
        ["Melbourne, Australia ", "melbourne, victoria, australia"],
        ["Barcelona", "barcelona, catalonia, spain"],
        ["London", "london, england, united kingdom"],
        ["Birmingham, UK", "birmingham, united kingdom"],
        ["Berlin, Europe", "berlin, berlin, germany"],
        ["Rotterdam, The Netherlands", "rotterdam, south holland, netherlands"],
        ["Brazil", "brazil"],
        ["Los Angeles ", "los angeles, california, united states"],
        ["Geneva, Switzerland", "geneva, canton of geneva, switzerland"],
        ["Toronto, ON Canada", "toronto, ontario, canada"],
        ["Washington DC", "washington dc, district of columbia, united states"],
        ["DC", "washington dc, district of columbia, united states"],
        [
            "Washington D.C.",
            "washington dc, district of columbia, united states"
        ],
        ["D.C.", "washington dc, district of columbia, united states"]
    ]

    tests.forEach(test => {
        expect(
            locationToString(entityMatcher(test[0], entities, populations))
        ).toBe(test[1])
    })
})

it("entities", async () => {
    const entities = await readStream<Entities>(
        (process.env.DIR_PATH || ".") + "/src/app/data/entities.json"
    )
    const populations = await extractPopulations()
    const tests = [
        ["Las Vegas,NV", "las vegas, nevada, united states"],
        ["US", "united states"],
        ["New York City", "new york city, new york, united states"],
        ["usa", "united states"],
        ["Maryland, USA", "maryland, united states"],
        ["Colorado ", "colorado, united states"],
        ["Sydney, New South Wales", "sydney, new south wales, australia"],
        ["UK", "united kingdom"],
        ["Salt Lake City, UT", "salt lake city, utah, united states"]
        //["Scotland", "scotland"], // not in database yet
        //["cardiff", "cardiff, united kingdom"], // not working since conflicting cities, both not in population
        //["St. Bonaventure, NY", "st bonaventure, new york, united states"] // not working because saint vs st
        //["St. Paul, Minnesota", "st. paul, minnesota, united states"],
        //["Kerry, Ireland", "kerry, ireland"]
    ]

    tests.forEach(test => {
        expect(
            locationToString(entityMatcher(test[0], entities, populations))
        ).toBe(test[1])
    })
})

import entityMatcher from "../src/lib/entityMatcher"
import { readStream, Entities } from "../src/utils/preprocessHelpers"
import extractPopulations from "../src/lib/populations"

/*it("entities", async () => {
    const entities = await readStream<Entities>(
        "/Users/kevinbai/Programming/twitter-scraper/src/data/entities.json"
    )
    const populations = await extractPopulations()

    const tests = [
        ["New York, NY", "new york, united states"],
        ["Thunder Bay, ON", "thunder bay, ontario, canada"],
        ["New oajf ojasioj York", ""],
        ["Houston, TX", "houston, texas, united states"],
        ["Atlanta, GA", "atlanta, georgia, united states"],
        ["Madrid", "madrid, community of madrid, spain"]
        ["Melbourne, Australia ", "melbourne, victoria, australia"],
        ["Barcelona", "barcelona, catalonia, spain"],
        ["London", "london, england, united kingdom"],
        ["Birmingham, UK", "birmingham, united kingdom"],
        ["Berlin, Europe", "berlin, berlin, germany"],
        ["Rotterdam, The Netherlands", "rotterdam, south holland, netherlands"],
        ["Brazil", "brazil"],
        ["Los Angeles ", "los angeles, california, united states"],
    ]

    tests.forEach(test => {
        expect(entityMatcher(test[0], entities, populations)).toBe(test[1])
    })
})*/

it("entities", async () => {
    const entities = await readStream<Entities>(
        "/Users/kevinbai/Programming/twitter-scraper/src/data/entities.json"
    )
    const populations = await extractPopulations()
    const tests = [
        /*["New York City", "new york city, new york, united states"],
        ["Geneva, Switzerland", "geneva, switzerland"],
        ["St. Paul, Minnesota", "st. paul, minnesota, united states"],*/
        //["Kerry, Ireland", "kerry, ireland"]
    ]

    tests.forEach(test => {
        expect(entityMatcher(test[0], entities, populations)).toBe(test[1])
    })
})

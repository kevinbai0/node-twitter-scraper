import { readStream } from "./preprocessing/helpers"
import extractPopulations from "./utils/populations"
import { getInitialState } from "./utils/helpers"
import { Entities } from "./preprocessing/types"

// get data
const entitiesPromise = readStream<Entities>(
    (process.env.DIR_PATH || ".") + "/src/app/data/entities.json"
)
const populations = extractPopulations()

const state = getInitialState()

export { entitiesPromise, populations, state }

import MongoDB from "mongodb"
import { connString } from "../systemConfig"

const db = new MongoDB.MongoClient(connString, { useUnifiedTopology: true })

export default db
    .connect()
    .then(client => {
        return client.db("coronavirus")
    })
    .catch(err => {
        console.error(err)
        return null
    })

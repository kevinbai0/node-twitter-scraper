import MongoDB from "mongodb"
require("dotenv").config()

const db = new MongoDB.MongoClient(process.env.MONGO_URL || "", {
    useUnifiedTopology: true
})

console.log("Will connect")
export default db
    .connect()
    .then(client => {
        console.log("Connected")
        return client.db("coronavirus")
    })
    .catch(err => {
        console.error(err)
        return null
    })

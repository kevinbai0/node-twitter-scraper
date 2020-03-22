import MongoDB from "mongodb"
require("dotenv").config()

const db = new MongoDB.MongoClient(process.env.MONGO_URL || "", {
    useUnifiedTopology: true
})

export default db
    .connect()
    .then(client => {
        return client.db("coronavirus")
    })
    .catch(err => {
        console.error(err)
        return null
    })

import { Db } from "mongodb"

export async function getRidOfDuplicates(db: Db) {
    const duplicates: unknown[] = []
    await (db.collection("tweets").aggregate([
        {
            $group: {
                _id: "$id_str",
                dups: { $addToSet: "$_id" },
                count: { $sum: 1 }
            }
        },
        {
            $match: {
                count: { $gt: 1 }
            }
        }
    ]) as any).forEach((doc: { dups: unknown[] }) => {
        doc.dups.shift() // First element skipped for deleting
        doc.dups.forEach(function(dupId: unknown) {
            duplicates.push(dupId)
        })
    })
    db.collection("tweets").deleteMany({ _id: { $in: duplicates } })
}

export async function convertStringsToDate(db: Db) {
    await db.collection("tweets").updateMany(
        {
            created_at: { $type: "string" }
        },
        [{ $set: { created_at: { $toDate: "$created_at" } } }]
    )
}

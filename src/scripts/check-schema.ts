import { db } from "../database/db";

async function checkSchema() {
    const tables = await db.all("SELECT name, sql FROM sqlite_master WHERE type='table'");
    console.log(JSON.stringify(tables, null, 2));
}

checkSchema();

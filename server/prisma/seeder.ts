import { prismaClient } from "../src/apps/database.ts";
import { Pool } from "pg";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });

async function main() {
    await prismaClient.user.createMany({
        data: [
            {username: "Randi"},
            {username: "Khairul"},
            {username: "Jamil"},
        ]
    });

    console.log('User seeded!');
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    await pool.end();
    process.exit(1);
  });
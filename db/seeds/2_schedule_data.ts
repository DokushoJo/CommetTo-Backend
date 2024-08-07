import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("schedule").del();

    // Inserts seed entries
    await knex("schedule").insert([
        { id: 800, name: "Meet" , description : "When we should meet" , time : new Date("2024-07-31T16:00:00")},
        { id: 801, name: "Eat" , description : "When we should eat" , time : new Date("2024-07-31T17:00:00")},
        { id: 802, name: "Leave" , description : "When we should leave" , time : new Date("2024-07-31T18:00:00")},
    ]);
};

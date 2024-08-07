import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("groups").del();

    // Inserts seed entries
    await knex("groups").insert([
        { group_id: 800, group_name: "rocket", created_by_user_id: 100 },
        { group_id: 801, group_name: "mean_girls", created_by_user_id: 100 },
        { group_id: 802, group_name: "kind girls", created_by_user_id: 100}
    ]);
};

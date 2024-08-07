import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable("groups", (table) => {
		table.string("description", 400);
        table.integer("created_by_user_id").notNullable();
})
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable("groups", (table) => {
        table.dropColumn("description");
        table.dropColumn("created_by_user_id");
    })
}


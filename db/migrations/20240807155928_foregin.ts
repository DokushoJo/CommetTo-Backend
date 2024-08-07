import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable("invitations", (table) => {
        table.dropForeign("user_id")
        table.dropForeign("group_id")
        table
        .foreign("user_id")
        .references("user.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
        table
        .foreign("group_id")
        .references("groups.group_id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE")
    })
}


export async function down(knex: Knex): Promise<void> {
}


import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("event_comments", (table) => {
        table.increments("id").primary()
        table.integer("event_id")
        table.foreign("event_id").references("events.id").onUpdate("CASCADE")
        table.text("comment").notNullable()
        table.timestamps(true, true)

    })
}


export async function down(knex: Knex): Promise<void> {
}


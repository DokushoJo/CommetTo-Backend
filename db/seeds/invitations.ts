import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("invitations").del();
        
    // Inserts seed entries
    await knex("invitations").insert([
        {   invitation_id: 1000, 
            group_id: 800,
            user_id: 100,
            accepted: true,
            rejected: false,
        },
        {  invitation_id: 1001,
            group_id: 800,
            user_id: 101,
            accepted: true,
            rejected: false, },
        {  
            invitation_id:1002,
            group_id:801,
            user_id: 100,
            accepted: true,
            rejected: false, }
    ]);
};




  
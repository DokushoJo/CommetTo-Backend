import { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
	//const hashPassword = await bcrypt.hash(userCredential.password, saltRounds);
	// Deletes ALL existing entries
	const saltRounds = Number(process.env.SALT || 8);
	
	await knex("user").del();

	// Inserts seed entries
	await knex("user").insert([
		{
			id: 100,
			username: "user",
			password: await bcrypt.hash("password", saltRounds), //password
			email: "email@email.com",
		},
		{
			id: 101,
			username: "friendly",
			password: await bcrypt.hash("qwerty", saltRounds),
			email: "ciao@email.com",
		},
		{
			id: 102,
			username: "condition",
			password: await bcrypt.hash("asdf", saltRounds),
			email: "condition@email.com",
		},
	]);
};

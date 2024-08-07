// src/index.js {path: './.env.local'}
import express, {
	Express,
	request,
	Request,
	Response,
	Router,
	NextFunction,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
	handleGETOneEvent,
	handlePostOneEvent,
	handlePutOneEvent,
	handleDeleteOneEvent,
	handleGetAllEventsInfo,
	handleFindGroupsByUser,
	handleFindUsersByGroup,
	handleMakeGroup,
	handleFindAllGroups,
	handleMakeInvitation,
	handleGetAllInvitations,
} from "./event/event.controller";
import bcrypt from "bcrypt";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { database } from "./knex";
import { loginRequest, registerRequest } from "./global";

dotenv.config({ path: "./.env.local" });

const app: Express = express();
const port = process.env.PORT || 3100;
const corsOptions = {
	origin: process.env.VITE_ORIGIN,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE");
	next();
});

export const SECRET_KEY: Secret = process.env.SECRET || "Secret-Key";
const saltRounds = Number(process.env.SALT || 8);

export interface CustomRequest extends Request {
	token: string | JwtPayload;
}

//Auth middllware
const auth = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.header("Authorization");

		if (!token) {
			throw new Error();
		}

		const decoded = jwt.verify(token, SECRET_KEY);
		(req as CustomRequest).token = decoded;

		next();
	} catch (err) {
		res.status(401).send("Please authenticate");
	}
};

//Auth login
app.post("/login", async (req: Request, res: Response) => {
	const userCredential: loginRequest = req.body;
	const result = await database("user")
		.select(["id", "password"])
		.where("username", userCredential.username)
		.first();

	if (result) {
		const username = result.username;
		const id = result.id;
		if (bcrypt.compareSync(userCredential.password, result.password)) {
			const token = jwt.sign(
				{ id: result.id?.toString(), username: result.username },
				SECRET_KEY,
				{
					expiresIn: "2 days",
				}
			);

			const cookie = { username: { id, username }, token: token };
			res.send(cookie);
		} else {
			res.sendStatus(401);
		}
	} else res.sendStatus(500);
});

//Auth register
app.post("/register", async (req: Request, res: Response) => {
	const userCredential: registerRequest = req.body;
	try {
		const hashPassword = await bcrypt.hash(userCredential.password, saltRounds);
		const newUserData = {
			username: userCredential.username,
			password: hashPassword,
			email: userCredential.email,
		};
		const checkIfExist = await database("user")
			.select("username")
			.where("username", newUserData.username)
			.first();
		console.log(checkIfExist);
		if (checkIfExist) {
			console.log("Already exists");
			res.sendStatus(409); // Conflict status code
		} else {
			const results: loginRequest[] = await database("user").insert(newUserData, [
				"id",
				"username",
			]);
			const result = results[0];
			const username = result.username;
			const id = result.id;
			const token = jwt.sign(
				{ id: result.id?.toString(), username: result.username },
				SECRET_KEY,
				{
					expiresIn: "2 days",
				}
			);

			const cookie = { username: { id, username }, token: token };
			res.send(cookie);
		}
	} catch (error) {
		res.sendStatus(500);
	}
});

//Default
app.get('/', (req: Request, res: Response) => {
	res.send("Backend server of CommetTo is running well!");
});

//Default
app.get('/health', (req: Request, res: Response) => {
	res.sendStatus(200);
});

//Event
app.get("/event/:id", auth, async (req: Request, res: Response) => {
	const result = await handleGETOneEvent(req, res);
	res.json(result);
});

app.post("/event", auth, async (req: Request, res: Response) => {
	const result = await handlePostOneEvent(req, res);
	res.json(result);
});

app.post("/groups", auth, async (req:Request, res: Response) => {
	const result = await handleMakeGroup(req, res);
	res.json(result[0]);
})

app.post("/invitations", auth, async (req: Request, res: Response) => {
	const result = await handleMakeInvitation(req, res);
	res.json(result)
})

app.put("/event", auth, (req: Request, res: Response) => {
	const result = handlePutOneEvent(req, res);
	res.json(result);
});

app.delete("/event/:id", auth, async (req: Request, res: Response) => {
	const result = await handleDeleteOneEvent(req, res);
	res.send(result);
});

app.get("/all-events/info/:user_id", auth, async (req: Request, res: Response) => {
	const result = await handleGetAllEventsInfo(req, res);
	res.json(result);
});

app.get("/groups/:id", auth, async (req: Request, res: Response) => {
	const result = await handleFindGroupsByUser(req, res);
	res.json(result)
})

app.get("/users/:group_id", auth, async (req: Request, res: Response) => {
	const result = await handleFindUsersByGroup(req, res);
	res.json(result)
})


//(for testing only)
app.get("/groups", auth, async (req: Request, res: Response) => {
	const result = await handleFindAllGroups(req,res);
	res.json(result)
})

app.get("/invitations", auth, async (req: Request, res: Response) => {
	const result = await handleGetAllInvitations(req, res);
	res.json(result);
});

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});



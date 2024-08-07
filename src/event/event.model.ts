import { event, infoForPage, eventInfo, infoForPageForJSON, infoForPageFromKnex, schedule, eventForJSON, scheduleForJSON, group, userInGroup, invite } from "../global";
import { database } from "../knex";

function castResult(result: infoForPageFromKnex[]) {
    let forController: infoForPage = {
        overview: {
            id: result[0].event_id,
            name: result[0].event_name,
            description: result[0].event_desc,
            date: new Date(result[0].event_date),
            updated_at: new Date(result[0].updated_at)
        },
        schedule: []
    }
    for (const r of result) {
        forController.schedule.push({
            id: r.schedule_id,
            name: r.schedule_name,
            time: r.time,
            description: r.schedule_desc
        })
    }
    return forController;
}

//select
async function selectDetailOfEvent(eventId: string) {
    const result = await database().from("event")
        .leftJoin("event_schedule", "event_schedule.event_id", "event.id")
        .leftJoin("schedule", "schedule.id ", "event_schedule.schedule_id")
        .select("event.id as event_id", "event.name as event_name", "event.description as event_desc", "event.date as event_date", "schedule_id",
            "schedule.name as schedule_name", "schedule.description as schedule_desc", "time", "event.updated_at").where("event.id", eventId)
    const casted = castResult(result)
    return casted;
}

async function selectSchedules(eventId: string) {
    const result: { schedule_id: number }[] = await database().from("event_schedule")
        .select("schedule_id").where("event_id", eventId)
    return result;
}

async function selectEachEventInfo(user_id: string) {
    const join: eventInfo[] = await database("event_user")
			.join("event", "event.id", "=", "event_user.event_id")
			.where("event_user.user_id", user_id)
			.select("id", "name", "date", "description");
    return join;
}

async function findGroupsByUser(user_id: string) {
    const groups: number[] = await database("invitations")
			.select("group_id")
			.where("user_id", user_id);
    return groups;
}

async function findUsersByGroup(group_id: number) : Promise<group>{
    const userObj: userInGroup[] = await database("invitations")
    .select("user_id", "accepted", "rejected", "user.username")
    .where("group_id", group_id).join("user", "user.id", "=", "invitations.user_id")
    const result = await database("groups")
    .select("group_name", "description", "created_by_user_id")
    .where("group_id", group_id)
    return { groupId: group_id, users: userObj, groupName: result[0].group_name, description: result[0].description, created_by_user_id: result[0].created_bu_user_id }
}

async function findGroups() {
    const groups = await database("groups")
    .select("group_name")
    return groups
}

async function findInvitations() {
    const invitations = await database("invitations")
    .select("*")
    return invitations
}

async function getUsersInOneGroup(groupId:number) {
    const users = await database("invitations").select("user_id", "accepted").where("group_id", groupId)
    return users
}

async function getUserNameById(id:number) {
    const userName = await database("user").select("username").where("id", id)
    return userName
}


//insert
async function insertDetailOfEvent(newEvent: infoForPageForJSON) {
    const event: eventForJSON = newEvent.overview;
    const schedules: scheduleForJSON[] = newEvent.schedule;
    const user_id: string = newEvent.user_id;
    const insertedEventId = await insertToEvent(event);
    const insertedScheduleIds = await insertToSchedule(schedules);
    const insertedEventUse = await insertToEventUser(user_id, insertedEventId[0].id);
    const eventToSchedule = await insertToEventAndSchedule(insertedEventId, insertedScheduleIds);
    return eventToSchedule;
}


async function insertToEvent(newEvent: eventForJSON) {
    const casted: event = {
        id: newEvent.id,
        name: newEvent.name,
        description: newEvent.description,
        date: new Date(newEvent.date),
        updated_at: new Date(newEvent.updated_at)
    }
    const insertedEventId: { id: number }[] = await database("event").insert({
        "name": casted.name,
        "description": casted.description, "date": casted.date, "updated_at": casted.updated_at
    }, ["id"])
    return insertedEventId;
}

async function insertToSchedule(schedules: scheduleForJSON[]) {
    const insertedScheduleIds: { id: number }[] = []
    for (const s of schedules) {
        const casted: schedule = {
            id: s.id,
            name: s.name,
            time: new Date(s.time),
            description: s.description
        }
        const insertedId: { id: number }[] = await database("schedule").insert({
            "name": casted.name,
            "description": casted.description, "time": casted.time
        }, ["id"])
        insertedScheduleIds.push(insertedId[0])
    }
    return insertedScheduleIds;
}

async function insertToEventUser (user_id: string, event_id: number ){
    return database("event_user").insert({ event_id: event_id, user_id: user_id});
}

async function insertToEventAndSchedule(eventIdObj: { id: number }[], scheduleIdsObj: { id: number }[]) {
    const eventId = eventIdObj[0].id
    const scheduleIds = scheduleIdsObj.map((obj) => obj.id)
    for (const s of scheduleIds) {
        await database("event_schedule").insert({
            "event_id": eventId,
            "schedule_id": s
        })
    }
    return { eventId, scheduleIds }
}

async function insertNewGroup(newGroup: group) {
    const groupName = await database("groups").insert({"group_name": newGroup.groupName, "description": newGroup.description, "created_by_user_id": newGroup.created_by_user_id}).returning(["group_id", "group_name", "created_by_user_id"])
    return groupName
}

async function insertFirstInvite(invite:invite) {
    const invitation = await database("invitations").insert({"group_id": invite.group_id, "user_id": invite.users[0], "accepted": invite.accepted, "rejected": invite.rejected}).returning(["group_id", "user_id"])
    return invitation
}



//Update
async function updateEvent(updatedEvent: infoForPageForJSON) {
    const event: eventForJSON = updatedEvent.overview
    const schedules: scheduleForJSON[] = updatedEvent.schedule
    //When we try update schedule, new schedule doesn't have id
    //zero, get schedule id based on event
    const updateddEventId: number = await updateToEvent(event)
    const shouldBeDeletedSchedule = await selectSchedules(event.id.toString())
    //first, delete schedule, schedule-event
    const deletedSchedules = await deleteToSchedule(shouldBeDeletedSchedule.map((e)=>e.schedule_id))
    const deletedRelations = await deleteToEventAndSchedule(event.id)
    //second, insert schedule, then insert schedule-event
    const insertedSchedules = await insertToSchedule(schedules)
    const insertedRelations = await insertToEventAndSchedule([{id:event.id}], insertedSchedules)

    return insertedRelations;
}

async function updateToEvent(event: eventForJSON) {
    const casted: event = {
        id: event.id,
        name: event.name,
        description: event.description,
        date: new Date(event.date),
        updated_at: new Date(event.updated_at)
    }
    const updateddEventId: number = await database("event").update({
        "name": casted.name,
        "description": casted.description, "date": casted.date, "updated_at": casted.updated_at
    }).where("id", "=", casted.id)
    return updateddEventId;
}

async function updateToSchedule(schedules: scheduleForJSON[]) {
    const updatedScheduleIds: number[] = []
    for (const s of schedules) {
        const casted: schedule = {
            id: s.id,
            name: s.name,
            time: new Date(s.time),
            description: s.description
        }
        updatedScheduleIds.push(s.id)
        const updateddId: number = await database("schedule").update({
            "name": casted.name,
            "description": casted.description, "time": casted.time
        }).where("id", "=", casted.id)
    }
    return updatedScheduleIds;
}

//delete
async function deleteEvent(eventId: string) {
    const shcdules: { schedule_id: number }[] = await selectSchedules(eventId)
    await deleteToEventAndSchedule(Number(eventId));
    await deleteToSchedule(shcdules.map((s) => s.schedule_id))
    await deleteToEvent(Number(eventId))
    return;
}

async function deleteToEventAndSchedule(eventId: number) {
    return await database.from("event_schedule").where("event_id", "=", eventId).del()
}

async function deleteToEvent(eventId: number) {
    return await database.from("event").where("id", "=", eventId).del()
}

async function deleteToSchedule(scheduleIds: number[]) {
    return await database.from("schedule").whereIn("id", scheduleIds).del()
}



export {
    selectDetailOfEvent,
    insertDetailOfEvent,
    updateEvent,
    deleteEvent,
    selectEachEventInfo,
    findGroupsByUser,
    findUsersByGroup,
    insertNewGroup,
    findGroups,
    insertFirstInvite,
    findInvitations,
    getUsersInOneGroup,
    getUserNameById
}

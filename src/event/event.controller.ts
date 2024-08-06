import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { event, eventInfo, group, infoForPage, infoForPageForJSON } from "../global";
import { selectDetailOfEvent, insertDetailOfEvent, updateEvent, deleteEvent, selectEachEventInfo, findGroupsByUser, findUsersByGroup } from "./event.model";
dotenv.config({ path: './.env.local' });

async function handleGETOneEvent(req: Request, res: Response) {
    const eventId: string = req.params.id;
    const infoForPage = await selectDetailOfEvent(eventId)
    return infoForPage;
}

async function handlePostOneEvent(req: Request, res: Response) {
    const newEvent: infoForPageForJSON = req.body //already JSON
    const updatedIdParis = await insertDetailOfEvent(newEvent)
    return updatedIdParis
}

async function handlePutOneEvent(req: Request, res: Response) {
    const updatedEvent: infoForPageForJSON = req.body //already JSON
    const updatedIdParis = await updateEvent(updatedEvent)
    return updatedIdParis
}

async function handleDeleteOneEvent(req: Request, res: Response) {
    const eventId = req.params.id
    const result = await deleteEvent(eventId)
    return result
}

async function handleGetAllEventsInfo(req: Request, res: Response) {
    const userId = req.params.user_id;
    const eventInfos: eventInfo[] = await selectEachEventInfo(userId);
    return eventInfos;
}

async function handleFindGroupsByUser(req: Request, res: Response) {
    const userId = req.params.id;
    const groups: number [] = await findGroupsByUser(userId);
    return groups
}

async function handleFindUsersByGroup(req: Request, res: Response) {
    const groupId = parseFloat(req.params.group_id)
    const groupObj: group = await findUsersByGroup(groupId);
    return groupObj
}

export {
    handleGETOneEvent,
    handlePostOneEvent,
    handlePutOneEvent,
    handleDeleteOneEvent,
    handleGetAllEventsInfo,
    handleFindGroupsByUser,
    handleFindUsersByGroup,
}
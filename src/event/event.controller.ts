import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { event, eventInfo, group, infoForPage, infoForPageForJSON, invite } from "../global";
import { selectDetailOfEvent, findGroups, getUserNameById, findInvitations, getUsersInOneGroup, insertFirstInvite, insertDetailOfEvent, insertNewGroup, updateEvent, deleteEvent, selectEachEventInfo, findGroupsByUser, findUsersByGroup } from "./event.model";
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

async function handleMakeGroup(req: Request, res: Response) {
    const newGroup: group = req.body
    const updatedGroupList = await insertNewGroup(newGroup);
    return updatedGroupList;
}

async function handleMakeInvitation(req:Request, res:Response) {
    const newInvitation: invite = req.body
    console.log(newInvitation)
    const updatedInvitationList = await insertFirstInvite(newInvitation);
    console.log(updatedInvitationList)
    return updatedInvitationList
    
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
    const eventInfos: event[] = await selectEachEventInfo(userId);
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

async function handleFindAllGroups(req: Request, res: Response) {
    const groups = await findGroups()
    return groups
}

async function handleGetAllInvitations(req: Request, res: Response) {
    const groups = await findInvitations()
    return groups
}

async function handleGetUsersInOneGroup(req: Request, res: Response) {
    const groupId:number = parseFloat(req.params.groupid)
    const users = await getUsersInOneGroup(groupId)
    return users

}

async function handleFindUserNameById(req: Request, res: Response) {
    const userId = parseFloat(req.params.userid)
    const userName = await getUserNameById(userId)
    return userName
}

export {
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
    handleGetUsersInOneGroup,
    handleFindUserNameById
}
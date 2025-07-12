import { PrismaClient } from '../generated/prisma';
const prisma = new PrismaClient();

async function addUser(username, password, bio) {
    const user = await prisma.user.create({ data: { username: username, password: password, bio: bio } });
    return user;
};

async function getUser(username) {
    const user = await prisma.user.findUnique({ where: { username: username } });
    return user;
};

async function sendMessage(authorId, recipientId) {
    const message = await prisma.message.create({ data: { authorId: authorId, recipientId: recipientId } });
    return message;
};

async function getMessages(username) {
    const messages = await prisma.message.findMany({ where: { recipientId: username } });
    return messages;
}

module.exports = { addUser, getUser, sendMessage, getMessages };
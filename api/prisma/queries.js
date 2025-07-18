const { PrismaClient } = require('../generated/prisma');

// Change database if it's for testing or not
const databaseUrl = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});


async function addUser(username, password, bio) {
    const user = await prisma.user.create({ data: { username: username, password: password, bio: bio } });
    return user;
};

async function updateUserBio(username, bio) {
    const user = await prisma.user.update({ where: { username: username }, data: { bio: bio } });
    return user;
};

async function getUser(username) {
    const user = await prisma.user.findUnique({ where: { username: username } });
    return user;
};

async function deleteUser(username) {
    const user = await prisma.user.delete({ where: { username: username } });
    return user;
}

async function sendMessage(authorId, recipientId, content) {
    const message = await prisma.message.create({ data: { authorId: authorId, recipientId: recipientId, content: content } });
    return message;
};

async function getMessages(authorId, recipientId) {
    const sentMessages = await prisma.message.findMany({ where: { authorId: authorId, recipientId: recipientId } });
    const receivedMessages = await prisma.message.findMany({ where: { authorId: recipientId, recipientId: authorId } });
    return [sentMessages, receivedMessages];
};

async function getContacts(userId) {
    const contacts = await prisma.message.findMany({ distinct: ['recipientId'], where: { authorId: userId }, include: { recipient: true } });
    return contacts;
}

async function deleteAllMessages() {
    await prisma.message.deleteMany();
}

async function deleteAllUsers() {
    await prisma.user.deleteMany();
}

module.exports = { prisma, addUser, updateUserBio, getUser, deleteUser, sendMessage, getMessages, getContacts, deleteAllMessages, deleteAllUsers };
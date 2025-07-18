const index = require("./index");
const db = require("./prisma/queries");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Authentication
const initPassport = require('./passport');
initPassport();

// Get index router
app.use("/", index);


// Global variable
let TOKEN;

test("creates new user with non matching passwords", done => {
  const data = { username: "testing", password: "abcdeff", passwordRepeat: "abcdefg", bio: "testing bio" };

  request(app)
    .post("/register")
    .type("form")
    .send(data)
    .expect("Content-Type", /json/)
    .expect("passwords don't match");

  done();
});


test("creates new user", async () => {
  const data = { username: "testing", password: "abcdef", passwordRepeat: "abcdef", bio: "testing bio" };

  const res = await request(app)
    .post("/register")
    .type("form")
    .send(data);

  expect(res.body).toEqual({ username: "testing", bio: "testing bio" });
});


test("login with wrong password", async() => {
  
  const res = await request(app)
    .post("/login")
    .type("form")
    .send({ username: "testing", password: "aaaaaa" });
  
  expect(res.body).toBe("Wrong password");
});


test("login", async() => {
  
  const res = await request(app)
    .post("/login")
    .type("form")
    .send({ username: "testing", password: "abcdef" });
  
  TOKEN = res.body.token;
  expect(res.body).toMatchObject({ username: "testing" })
});


test("update user without correct login", async () => {

  const res = await request(app)
    .put("/update")
    .type("form")
    .send({ bio: "another bio" });
  
  expect(res.status).toBe(401);
});


test("update user", async () => {

  const res = await request(app)
    .put("/update")
    .set('Authorization', `Bearer ${TOKEN}`)
    .type("form")
    .send({ bio: "another bio" });
    
  expect(res.body).toEqual({ username: "testing", bio: "another bio" });
});


test("get profile", async () => {

  const res = await request(app)
    .get("/testing")
    
  expect(res.body).toEqual({ username: "testing", bio: "another bio" });
});


test("send message to nonexistent user", async () => {

  const res = await request(app)
    .post("/message")
    .set('Authorization', `Bearer ${TOKEN}`)
    .type("form")
    .send({ recipient: "nouser", content: "testing"});
  
  expect(res.status).toBe(400);
});


test("send message correctly", async () => {

  // Create another user
  await request(app)
    .post("/register")
    .type("form")
    .send({ username: "testing2", password: "abcdef", passwordRepeat: "abcdef", bio: "another testing" });
  
  const res = await request(app)
    .post("/message")
    .set('Authorization', `Bearer ${TOKEN}`)
    .type("form")
    .send({ recipient: "testing2", content: "testing"});

  expect(res.body).toMatchObject({ content: "testing" });
});


test("get messages", async () => {

  const res = await request(app)
    .get("/messages/testing2")
    .set('Authorization', `Bearer ${TOKEN}`);

  expect(res.body[0][0]).toMatchObject({ content: "testing" });

});

test("get contacts", async () => {

  const res = await request(app)
    .get("/contacts")
    .set('Authorization', `Bearer ${TOKEN}`);

  console.log(res.body)

  expect(res.body).toEqual(["testing2"]);

  await db.deleteAllMessages();
  await db.deleteAllUsers();
});
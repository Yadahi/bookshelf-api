import request from "supertest";
import app from "../app.js";
import db from "../db.js";
import { beforeAll, describe, expect } from "vitest";

beforeAll(() => {
  db.prepare("DELETE FROM users").run();
});

describe("POST register", () => {
  it("should register a user", async () => {
    const response = await request(app).post("/auth/register/").send({
      username: "test-user-02",
      password: "test1234",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User registered");
  });

  it("should return validation error", async () => {
    const response = await request(app)
      .post("/auth/register/")
      .send({
        password: "test1234",
      })
      .expect(400);

    expect(response.body.error).toBe("Username is required");
  });
});

describe("POST login", () => {
  it("should login registered user", async () => {
    const response = await request(app).post("/auth/login").send({
      username: "test-user-02",
      password: "test1234",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User logged in");
    expect(response.body.token).toBeDefined();
  });

  it("should return error message invalid credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        username: "test-user-02",
        password: "test12345",
      })
      .expect(401);

    expect(response.body.error).toBe("Invalid credentials");
  });
});

import request from "supertest";
import express from "express";

// Create a minimal mocked Express app for the health check route
const app = express();
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Nexus API is running securely" });
});

describe("System Health Check", () => {
  it("should return a 200 OK status on /health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      message: "Nexus API is running securely",
    });
  });
});

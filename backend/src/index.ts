import { Hono } from "hono";
import { handle } from "hono/vercel";

export const config = {
  runtime: "edge",
};

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!!!!!🔥!" });
});

export default handle(app);

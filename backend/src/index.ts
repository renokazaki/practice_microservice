import { Hono } from "hono";
import { handle } from "hono/vercel";
import { PrismaClient } from "@prisma/client";

// 代わりにServerless設定を使用
export const config = {
  runtime: "nodejs18.x", // または "nodejs20.x" などの新しいバージョン
};
// Prismaクライアントの初期化
const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});
const app = new Hono();

// データベース接続の確認
prisma
  .$connect()
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!!!!!🔥!" });
});

app.get("/todos", async (c) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return c.json(todos);
  } catch (error) {
    return c.json({ error: "Failed to fetch todos" }, 500);
  }
});

export default handle(app);

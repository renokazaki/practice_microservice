import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient } from "@prisma/client";

// Prismaクライアントの初期化
const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

// アプリケーションの初期化
const app = new Hono();

// CORSミドルウェアの設定
app.use(
  "/*",
  cors({
    origin: [
      "https://practice-microservice-front.vercel.app",
      "http://localhost:3000",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// データベース接続の確認
prisma
  .$connect()
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });

// Todo一覧の取得
app.get("/todos", async (c) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return c.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return c.json({ error: "Failed to fetch todos" }, 500);
  }
});

// Todoの作成
app.post("/todos", async (c) => {
  try {
    const { title } = await c.req.json();
    const todo = await prisma.todo.create({
      data: {
        title,
      },
    });
    return c.json(todo);
  } catch (error) {
    console.error("Error creating todo:", error);
    return c.json({ error: "Failed to create todo" }, 500);
  }
});

// Todoの更新
app.put("/todos/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const { completed } = await c.req.json();
    const todo = await prisma.todo.update({
      where: { id },
      data: { completed },
    });
    return c.json(todo);
  } catch (error) {
    console.error("Error updating todo:", error);
    return c.json({ error: "Failed to update todo" }, 500);
  }
});

// Todoの削除
app.delete("/todos/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    await prisma.todo.delete({
      where: { id },
    });
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return c.json({ error: "Failed to delete todo" }, 500);
  }
});

// サーバーの起動
serve({
  fetch: app.fetch,
  port: 3001,
});

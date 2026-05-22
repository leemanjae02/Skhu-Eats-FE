import express from "express";
import cors from "cors";
import { createMiddleware } from "@mswjs/http-middleware";
import { handlers } from "./handlers";

const app = express();
const PORT = 9090;

app.use(cors({ origin: /^http:\/\/(localhost|127\.0\.0\.1):\d+$/ }));
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[MSW Server] Incoming: ${req.method} ${req.originalUrl} from ${req.headers.origin}`);
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[MSW Server] Result: ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.use(express.json());
app.use(createMiddleware(...handlers));

// Fallback for unhandled routes
app.use((req, res) => {
  console.log(`[MSW] 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ message: `Mock handler not found for ${req.method} ${req.path}` });
});

app.listen(PORT, () => {
  console.log(`[MSW] Mock server running on http://localhost:${PORT}`);
});

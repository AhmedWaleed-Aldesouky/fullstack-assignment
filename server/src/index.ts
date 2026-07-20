import express from "express";
import type { InboundMessage } from "../../shared/types.js";

const app = express();
app.use(express.json());

// Receives inbound messages from the simulator (and, in real life, a provider).
// TODO: validate the payload, store it in the right conversation, decide how to
// handle duplicate ids (see README), and optionally call the assistant.
app.post("/api/webhook", (req, res) => {
  const message = req.body as InboundMessage;
  void message; // TODO: use it

  res.status(501).json({ ok: false, error: "not implemented" });
});

// TODO: add the endpoints the UI needs, e.g.
//   GET  /api/conversations            list (optional ?search=)
//   GET  /api/conversations/:id        one thread
//   POST /api/conversations/:id/reply  agent reply

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

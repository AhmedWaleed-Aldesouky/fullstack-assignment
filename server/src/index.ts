import express from 'express';
import type { InboundMessage } from '../../shared/types.js';
import { processInboundMessage } from './store.js';

const app = express();
app.use(express.json());

// Receives inbound messages from the simulator (and, in real life, a provider).
// TODO: validate the payload, store it in the right conversation, decide how to
// handle duplicate ids (see README), and optionally call the assistant.
app.post('/api/webhook', (req, res) => {
  const message = req.body as InboundMessage;

  // 1. Validate the payload
  if (!message || !message.id || !message.from || !message.text) {
    return res
      .status(400)
      .json({ ok: false, error: 'Missing required fields' });
  }

  // 2. Store it in the right conversation & 3. Decide how to handle duplicate ids
  const { isNew } = processInboundMessage(message);

  if (!isNew) {
    // We already have this message ID. Return 200 OK so the provider stops retrying.
    return res.status(200).json({ ok: true, status: 'duplicate ignored' });
  }

  // Successfully processed new message
  res.status(200).json({ ok: true });
});

// TODO: add the endpoints the UI needs, e.g.
//   GET  /api/conversations            list (optional ?search=)
//   GET  /api/conversations/:id        one thread
//   POST /api/conversations/:id/reply  agent reply

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

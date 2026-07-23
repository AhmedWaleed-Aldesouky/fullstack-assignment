import express from 'express';
import type { InboundMessage } from '../../shared/types.js';
import {
  processInboundMessage,
  getAllConversations,
  getThread,
  addReply,
} from './store.js';

const app = express();
app.use(express.json());

// Receives inbound messages from the simulator (and, in real life, a provider).
// TODO: validate the payload, store it in the right conversation, decide how to
// handle duplicate ids (see README), and optionally call the assistant.
app.post('/api/webhook', (req, res) => {
  const message = req.body as InboundMessage;

  // Validate the payload
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
app.get('/api/conversations', (req, res) => {
  const allConvos = getAllConversations();

  // Attach preview text and the last message timestamp for the UI
  const mappedConvos = allConvos.map((convo) => {
    const thread = getThread(convo.id);
    const lastMessage = thread.length > 0 ? thread[thread.length - 1] : null;

    return {
      ...convo,
      previewText: lastMessage ? lastMessage.text : 'No messages yet',
      lastMessageAt: lastMessage
        ? lastMessage.timestamp
        : new Date(0).toISOString(),
    };
  });
  // Sort newest first
  mappedConvos.sort((a, b) => {
    return (
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  });

  res.json(mappedConvos);
});

//   GET  /api/conversations/:id        one thread
app.get('/api/conversations/:id', (req, res) => {
  const { id } = req.params;
  const thread = getThread(id);

  // Validate if the conversation exists
  if (!thread || thread.length === 0) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  // Return the thread of messages for the conversation in JSON format
  res.json(thread);
});

//   POST /api/conversations/:id/reply  agent reply
app.post('/api/conversations/:id/reply', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  // Validate the existence of reply text
  if (!text) {
    return res.status(400).json({ error: 'Reply text is required' });
  }

  try {
    // Save the agent's manual reply to the store
    const newReply = addReply(id, text, 'agent');
    res.json(newReply);
  } catch (error) {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

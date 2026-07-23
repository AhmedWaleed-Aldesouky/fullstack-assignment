# Take-Home: Conversation Inbox

A small exercise — about **1–2 hours**. Please don't spend more. If you run out of time, stop and note what you'd do next in the README. A small, finished result is better than a large, unfinished one.

## The task

Support agents handle customer messages in a shared inbox. Build a small version of it.

Messages arrive at a webhook (the included simulator plays the sender). You store them, group them into conversations per customer, sometimes reply automatically, and let an agent reply by hand.

This starter includes the project setup, sample data, and the simulator. You write the feature.

### Stubs to fill in

- `POST /api/webhook` (`server/src/index.ts`) — receives messages. Returns 501 until you implement it.
- `assistantReply()` (`server/src/assistant.ts`) — decides whether to auto-reply and what to say. Returns `null` until you implement it.
- `server/src/store.ts` — where you keep data (your choice, see below).
- `client/` — a React app; replace the placeholder page.

### Required

1. Implement `POST /api/webhook`: accept a message and store it in the right conversation (one per customer).
2. Add the API endpoints your UI needs (list conversations, get a thread, post a reply).
3. Show the conversation list (newest first, with a preview); open a thread to read it.
4. Let an agent send a reply; persist it and show it in the thread.
5. Implement `assistantReply()` so some messages get an automatic reply — e.g. a greeting, an order question, or a product question answered from the catalog. Two or three rules is enough; don't over-invest here.
6. Search conversations by customer name or message text.
7. Update this README (see "What to submit").

### One decision we leave to you

Messaging providers deliver the same message more than once (retries). The simulator can too — resend a message with the same `id`. Decide what should happen, implement it, and explain your choice in a sentence or two.

### Data store

Keep data wherever fits: an in-memory variable, a JSON file, or SQLite. No database server needed. Say what you chose and why.

## Optional (only if you have time)

None of these are required.

- Unread counts
- Optimistic UI when sending a reply
- Tests for the assistant
- Product recommendations from the catalog
- Loading / error / empty states

## Running it

Node 20+.

```bash
npm install
npm run dev     # API on :4000, app on http://localhost:5173
npm run seed    # load sample messages (run after dev is up)
```

Open http://localhost:5173. Calls to `/api/*` are proxied to the server.

Send a message:

```bash
npm run simulate -- --name "Emma Clark" --from "+15550001001" --text "do you have a desk lamp?"
```

Test a duplicate (same id twice):

```bash
npm run simulate -- --id dup-1 --text "hello"
npm run simulate -- --id dup-1 --text "hello"
```

Until you implement the webhook it returns 501 — that's expected.

## What to submit

1. A GitHub repo (fork/clone this one). Public, or private with an invite to GitHub user **@soroushahrari** (or email **soroush.ahrari@arcuscorp.it**).
2. This README, updated with:
   - How to run it, if different from above.
   - **Decisions & trade-offs** — include your duplicate-message decision, your data-store choice, and anything you left out.
   - **AI usage** — using AI tools is fine and encouraged. Briefly note what you used them for and where you changed their output.
   - **What's next** — what you'd add or improve with more time.

## What we look at

We care about how you work, not a perfect result.

- Whether it works.
- Backend: a clean, sensible data model and API.
- Frontend: a functional, easy-to-use UI.
- Readable, maintainable code.
- Clear explanations of your choices.

## Notes

- Aim for 1–2 hours.
- AI tools are allowed; just note how you used them.
- Questions are welcome — email **soroush.ahrari@arcuscorp.it**.

## How to run it

Similar as provided.

## Decisions & trade-offs

- **Duplicate-Message:** If the `ID` is the same, then it's exactly the same message, so it would be ignored. I thought about doing it with the text, but some times a similar messages (e.g., "Ok") are sent multiple times in the same conversation for different contexts, so it should be left.
- **Data-Store:** I added <ins>three types</ins>;
  - _Sender_: customer: from inbound message, agent: human agent, and asisstant: automatic asisstant.
  - _Message_: more general than `InboundMessage` as it holds any message and reply.
  - _Conversation:_ one conversation per customer holding the whole message thread.

## AI usage

I have already menitoned in my CV that I have experience in `NextJS` (as a fullstack framework using [Next-Forge](https://www.next-forge.com/docs) architecture), `TypeScript` and `ReactJS`. I never used `NodeJS`, or `ExpressJS`, so I used the AI (specifically `Gemini`, the web version) in:

- **Backend:** to learn more about the syntax of `NodeJS`, which turned out to be very much similar to `NextJS`.
- **Frontend:** better, faster frontend building with proper `HTML` structuring and good `CSS` styling.

I am coding in VS Code not in Cursor, because I consider myself in the learning phase. This way enforces me to ask questions rather than be lazy and let the agent write the code for me, but my Smarterminds experience was totally developing in Cursor.

## What's next

### Required

To be honest, I have only finished till step 4 in 2 work hours. For the remaining tasks:

- Implementing `assistantReply()`: I can go in three levels:
  - _level 1:_ simple if conditioning; if the inboundMessage.text = ... , then addReply(...).
  - _level 2:_ introduce some AI api key (e.g., Google AI Studio free api keys) in a private `.env` file holding it as an environment variable, and give it some context about the conversation and the app (rules, proper responses, and when to not respond & make the notification for the <ins>human agent</ins> to respond). Then, I make sure he response is well-parsed and doesn't damage the frontend. Eventually, add the layer to parse, when the AI gives the wheel to the human agent.
  - _level 3:_ add some controlling AI prompt evaluation using an open-source tool like `PromptFoo` to ensure that this repsonse doesn't give some hallucination, isn't using too much tokens, gives proper concise responses, and doesn't take too much time.

- Search conversations by customer name or message text: I can go up to four levels:
  - _level 1:_ implement proper <ins>lexical search</ins> to use exact strings or substrings from all the conversations or messages of the data. We give the user, two searching input areas (`search by customer name` aka. conversation, and `search by message`).
  - _level 2:_ (which I think for this app, we don't need to go further) implement lexical search by <ins>customer name</ins>, then by <ins>message</ins>. If both return null, we handle that by a message in the frontend.
  - _level 3:_ add a `use AI` button in the search bar for `semantic search`, but it would require either context management, and implementation of LLM chaining (request --> response --> parse --> action --> request --> response --> parse --> Action --> ...), which chain length depends on how large is the dataset, which add better UX with higher cost of implementation and maintenance.
  - _level 4:_ is about the hybrid search that, if there is no return with the lexical search, we start the flow of the semantic search without the user getting in the loop, which add a little bit better UX.

### Optional

- _Unread counts:_ could be done by a simple boolean flag <ins>read</ins> of default = false, once opened the conversation is handled by a state management, and could be unread using a button to update the state.
- _Tests for the assistant:_ just same for the others.
- _Loading:_ state management, so that the waiting promises can have the loading state and the loading CSS.

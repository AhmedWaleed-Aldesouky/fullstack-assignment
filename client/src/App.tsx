export default function App() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1>Mini Conversation Inbox</h1>
      <p>
        This is the starting point. Build the inbox here (see{" "}
        <code>README.md</code>).
      </p>
      <ol style={{ lineHeight: 1.8 }}>
        <li>
          Implement <code>POST /api/webhook</code> in{" "}
          <code>server/src/index.ts</code>.
        </li>
        <li>
          Choose and implement a data store in <code>server/src/store.ts</code>.
        </li>
        <li>
          Implement the assistant in <code>server/src/assistant.ts</code>.
        </li>
        <li>
          Add the endpoints the UI needs, then replace this page with the inbox
          (conversation list + thread + reply + search).
        </li>
      </ol>
      <p>
        The dev server proxies <code>/api/*</code> to the Node server, so you can
        call <code>fetch(&quot;/api/...&quot;)</code> from here directly. Run{" "}
        <code>npm run seed</code> once both are up to populate sample
        conversations.
      </p>
    </main>
  );
}

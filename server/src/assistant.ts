import type { InboundMessage } from "../../shared/types.js";

// Decides whether to auto-reply, and what to say. No real AI here — keep it to a
// few simple, deterministic rules (see data/catalog.json for products). Return
// the reply text, or null to leave the message for a human. Two or three rules
// is enough; don't over-invest.
export function assistantReply(message: InboundMessage): string | null {
  // TODO: implement
  return null;
}

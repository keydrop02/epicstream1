"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { MessageSquareText, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEEDBACK_EMAIL = "feedback@epicstream.com";
const MAX_CHARS = 2000;
const QUEUE_KEY = "epicstream:feedbackQueue";

const FIELD_CLASS =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

type FeedbackItem = { id: string; message: string; email: string };

let draining = false;

function readQueue(): FeedbackItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? (JSON.parse(raw) as FeedbackItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: FeedbackItem[]) {
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // storage unavailable; drop silently
  }
}

async function sendItem(item: FeedbackItem): Promise<boolean> {
  const endpoint = process.env.NEXT_PUBLIC_FEEDBACK_WEBAPP_URL;
  if (!endpoint) return true;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ message: item.message, email: item.email }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = (await res.json()) as { ok?: boolean };
    return data.ok === true;
  } catch {
    return false;
  }
}

async function drainQueue() {
  if (draining) return;
  draining = true;
  try {
    const queue = readQueue();
    while (queue.length > 0) {
      const ok = await sendItem(queue[0]);
      if (!ok) break;
      queue.shift();
      writeQueue(queue);
    }
  } finally {
    draining = false;
  }
}

export function FeedbackDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    drainQueue();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sent) return;

    const endpoint = process.env.NEXT_PUBLIC_FEEDBACK_WEBAPP_URL;
    if (!endpoint) {
      const subject = "[EpicStream] Feedback";
      const body = message.trim() + (email.trim() ? `\n\nEmail: ${email.trim()}` : "");
      const url = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = url;
      onClose();
      return;
    }

    setSent(true);
    setTimeout(onClose, 1200);

    const queue = readQueue();
    queue.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, message: message.trim(), email: email.trim() });
    writeQueue(queue);
    drainQueue();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        aria-describedby="feedback-description"
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div id="feedback-title" className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquareText className="h-5 w-5 text-primary" />
            Send Feedback
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div id="feedback-description" className="flex flex-col gap-3 px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Help us make EpicStream better. Spotted a problem or have an idea? Tell us below.
          </p>
          <p className="flex items-start gap-1.5 rounded-md border border-primary/20 bg-primary/5 p-2.5 text-xs font-semibold text-foreground/90">
            <span>
              <strong>Stream not working?</strong> Try another server or enable{" "}
              <a
                href="https://1.1.1.1/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                1.1.1.1 WARP
              </a>
              , then reload the page.
            </span>
          </p>

          <div className="grid gap-1.5">
            <label htmlFor="feedback-message" className="text-xs font-medium text-muted-foreground">
              Message <span className="text-primary">*</span>
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think..."
              rows={4}
              maxLength={MAX_CHARS}
              required
              className={`${FIELD_CLASS} min-h-[96px] max-h-[50vh] resize-y py-2.5`}
            />
            <div className="text-right text-xs text-muted-foreground">
              {message.length}/{MAX_CHARS} characters
            </div>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="feedback-email" className="text-xs font-medium text-muted-foreground">
              Email{" "}
              <span className="font-normal text-muted-foreground/60">(optional)</span>
            </label>
            <input
              id="feedback-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div className="flex items-center border-t border-border px-5 py-4">
          {sent && (
            <p className="text-sm text-emerald-500">Sent, thank you!</p>
          )}
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!message.trim() || sent}>
              <Send className="h-4 w-4" />
              Send Feedback
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
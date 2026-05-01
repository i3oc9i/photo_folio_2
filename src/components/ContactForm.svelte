<script lang="ts">
  type Status = "idle" | "sending" | "ok" | "error";
  let status = $state<Status>("idle");
  let errorMsg = $state<string>("");

  async function onsubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    status = "sending";
    errorMsg = "";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Send failed");
      status = "ok";
      form.reset();
    } catch (err) {
      status = "error";
      errorMsg = err instanceof Error ? err.message : "Unknown error";
    }
  }
</script>

<form action="/api/contact" method="post" {onsubmit} novalidate>
  <label>
    <span>Name</span>
    <input type="text" name="name" required autocomplete="name" />
  </label>

  <label>
    <span>Email</span>
    <input type="email" name="email" required autocomplete="email" />
  </label>

  <label>
    <span>Message</span>
    <textarea name="message" rows="6" required></textarea>
  </label>

  <!-- honeypot: real users won't fill this; bots will -->
  <label class="hp" aria-hidden="true">
    Website
    <input type="text" name="website" tabindex="-1" autocomplete="off" />
  </label>

  <button type="submit" disabled={status === "sending"}>
    {status === "sending" ? "Sending…" : "Send"}
  </button>

  {#if status === "ok"}
    <p class="msg ok">Thanks — message sent. I'll reply soon.</p>
  {:else if status === "error"}
    <p class="msg err">Couldn't send: {errorMsg}. Please try again.</p>
  {/if}
</form>

<style>
  form { display: grid; gap: 1rem; max-width: 36rem; }
  label { display: grid; gap: 0.35rem; font-size: 0.9rem; }
  label span { opacity: 0.75; }
  input, textarea {
    background: #161618;
    color: inherit;
    border: 1px solid #2a2a2e;
    border-radius: 4px;
    padding: 0.65rem 0.75rem;
    font: inherit;
  }
  input:focus, textarea:focus { outline: 2px solid #6c8cff; outline-offset: 1px; }
  textarea { resize: vertical; }
  button {
    justify-self: start;
    padding: 0.65rem 1.25rem;
    background: #ececec;
    color: #0b0b0c;
    border: 0;
    border-radius: 4px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
  button:disabled { opacity: 0.6; cursor: progress; }
  .hp { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
  .msg { margin: 0; font-size: 0.9rem; }
  .msg.ok { color: #7ee787; }
  .msg.err { color: #ff9a9a; }
</style>

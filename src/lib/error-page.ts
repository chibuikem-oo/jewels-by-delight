import { FALLBACK_WHATSAPP_LINK } from "./contact-fallback";

// Shown when the server can't render a page at all. Self-contained HTML in the
// site's warm ivory/brown look, so visitors never see a blank screen.
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>JewelsByDelight | We'll be back shortly</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <style>
      body { font: 16px/1.6 Karla, system-ui, -apple-system, sans-serif; background: #F9F6F0; color: #453528; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      .eyebrow { font-size: .75rem; font-weight: 600; letter-spacing: .35em; text-transform: uppercase; color: #B58A56; margin: 0; }
      h1 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 500; font-size: 2.25rem; line-height: 1.15; margin: 1rem 0 0; }
      p.copy { color: #7a6a5c; margin: 1rem 0 2rem; }
      .actions { display: flex; flex-direction: column; align-items: center; gap: .75rem; }
      a.primary { display: inline-block; padding: .9rem 2rem; border-radius: 999px; background: #79583C; color: #F9F6F0; font-size: .75rem; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; text-decoration: none; }
      button { background: none; border: 0; color: #79583C; font: inherit; font-size: .85rem; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; cursor: pointer; }
    </style>
  </head>
  <body>
    <div class="card">
      <p class="eyebrow">JewelsByDelight</p>
      <h1>We'll be back shortly</h1>
      <p class="copy">Our watch collection is taking a short break. You can still message us on WhatsApp and we'll help you find your watch.</p>
      <div class="actions">
        <a class="primary" href="${FALLBACK_WHATSAPP_LINK}" target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>
        <button onclick="location.reload()">Try again</button>
      </div>
    </div>
  </body>
</html>`;
}

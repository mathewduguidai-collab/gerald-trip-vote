# Gerald Trip Vote — public frontend

This public repository hosts two distinct mobile-friendly static pages for Gerald: the trip-voting website at the root, and the separately contained concert radar under `/concerts/`.

**Live website:** https://mathewduguidai-collab.github.io/gerald-trip-vote/

- **Hosting:** GitHub Pages, from `main` / repository root. No paid infrastructure or backend deployed here.
- **Backend:** Existing Gerald Supabase Edge Function, accessed over HTTPS with per-invite bearer tokens.
- **Privacy:** This repository contains no participant names, votes, email addresses, database credentials, secrets, or private operational files. Authorized ballots and votes are stored in the separate private Gerald Supabase database.
- **Access:** A unique private invite link is required to load a ballot. Sharing a link can allow another person to vote as its intended recipient. This is suitable only for nonfinancial group preferences; it never authorizes bookings or payments.
- **Publishing:** A push to `main` rebuilds this website automatically through GitHub Pages. Do not add real trip data or credentials to this public repository.
- **Current qualification:** Test participants only. Real invitations remain subject to the owner's separate approval and fresh provider availability checks.

Durable system definition and backend source remain in Gerald's **private** repository.

## Concert Radar (public, static snapshot)

**Open:** https://mathewduguidai-collab.github.io/gerald-trip-vote/concerts/

- Separate assets live in `concerts/index.html`, `concerts/app.css`, `concerts/app.js`, and `concerts/data.json`. The original voting frontend stays at the root unchanged.
- User-approved public publication of **concert matches and derived Spotify listening ranks/counts** only; no private home origin, invitations, votes, emails, private authentication credentials, or Supabase secret/service keys included.
- The October 8, 2026 JSON contains 179 currently matched concerts and 210 matched performer appearances from the private Gerald Supabase database. This is a **snapshot**, not an automatically refreshing connection. Refresh by regenerating the client-safe JSON from the private ranking views through an authorized server-side workflow.
- Candidate concerts have unverified ticket status and/or venue-specific drive time until separately sourced; never infer available tickets or route qualification. Public source links are included where known; other shows offer a clearly labeled search link.
- **Do not connect the public browser directly to Gerald's private Supabase tables or embed any secret key in front-end files.** Versioned score/ranking SQL and authority remain in the private Gerald repo.

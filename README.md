# Gerald Trip Vote — public frontend

This repository contains only the static, mobile-friendly voting website for Gerald's trip-planning experiments.

**Live website:** https://mathewduguidai-collab.github.io/gerald-trip-vote/

- **Hosting:** GitHub Pages, from `main` / repository root. No paid infrastructure or backend deployed here.
- **Backend:** Existing Gerald Supabase Edge Function, accessed over HTTPS with per-invite bearer tokens.
- **Privacy:** This repository contains no participant names, votes, email addresses, database credentials, secrets, or private operational files. Authorized ballots and votes are stored in the separate private Gerald Supabase database.
- **Access:** A unique private invite link is required to load a ballot. Sharing a link can allow another person to vote as its intended recipient. This is suitable only for nonfinancial group preferences; it never authorizes bookings or payments.
- **Publishing:** A push to `main` rebuilds this website automatically through GitHub Pages. Do not add real trip data or credentials to this public repository.
- **Current qualification:** Test participants only. Real invitations remain subject to the owner's separate approval and fresh provider availability checks.

Durable system definition and backend source remain in Gerald's **private** repository.

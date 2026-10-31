# WEGYM exercise video review

This build has **5 candidate video embeds** across 50 exercises in the seven newer training styles. The remaining 45 have targeted YouTube search links; they are **not** completed video integrations.

## Before promoting a candidate to verified
1. Open its original YouTube link.
2. Confirm the demonstrated exercise matches the card.
3. Check the full duration is no longer than 5:00.
4. Confirm the creator allows embedding and playback works on the live site.
5. Confirm the thumbnail, mobile sizing, and original attribution.

The new candidate is Pilates > Glute Bridge (Rhythm Fit, YouTube ID E2zKYWNKPkA), advertised as a 60-second tutorial.

## Deployment
This ZIP retains `.github/workflows/deploy.yml`, the ranking logic in `js/script.js`, and the account/nutrition pages. It is not automatically deployed: commit updated files to GitHub, then confirm the GitHub Actions workflow succeeds. Back up the current site first.

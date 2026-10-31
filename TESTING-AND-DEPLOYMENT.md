# WEGYM — Browser, Mobile and Deployment Checklist

## Automated checks completed (October 31, 2026)
- Six HTML pages exist.
- All relative `href` and `src` paths in the six HTML files point to existing local files.
- JavaScript files passed Node syntax checks (see below).
- ZIP archive created and validated.

## NOT YET VERIFIED
- Real browser navigation, responsive layout, and interaction: browser sandbox blocked both localhost and file URLs.
- Supabase account creation, sign-in, and cross-device cloud sync: needs project credentials.
- Live deployment: requires your GitHub repository and enabling Pages.
- External YouTube links and thumbnails: not checked for availability.
- Workout cards marked "Video Coming Soon": still placeholders.

## Manual desktop/mobile test (after downloading)
1. In VS Code, open the WEGYM folder and use Live Server on `index.html`.
2. Test all six navigation links on desktop (Chrome, Edge, Firefox if available).
3. In Chrome press F12 > Toggle device toolbar (Ctrl+Shift+M). Test 390 x 844 (phone), 768 x 1024 (tablet), and 1440 x 900 (desktop).
4. At each width: no horizontal scrolling; navbar opens and links work; cards/text are readable; buttons do not overlap.
5. On Workout Videos, search "Bench Press", filter Chest, then clear search. Check that cards change and no-results message appears for nonsense searches.
6. Log a workout, refresh the page, confirm it stays logged, undo it, and confirm it clears.
7. Log workouts on three different dates in one week (real dates, no date spoofing required for production). Confirm the weekly counter and rank change.
8. Check that all external video links open and videos exist. Replace any placeholders before claiming the video library is complete.
9. After configuring Supabase, create an account, verify email if required, log a workout, then sign in on a second browser to verify sync.
10. Confirm reset prompts for confirmation and only deletes the current user's progress.

## Publish using GitHub Pages
1. Create a **public GitHub repository** called `WEGYM` (or open your existing WEGYM repository).
2. Upload the **contents of this WEGYM folder** to the repository root, including the hidden `.github` folder and `.nojekyll` file. Do not upload the parent folder itself.
3. Commit and push to the `main` branch.
4. In the repository select **Settings > Pages > Build and deployment > Source > GitHub Actions**.
5. Open **Actions** and wait for `Deploy WEGYM to GitHub Pages` to complete successfully. If necessary, click **Run workflow**.
6. Your site will usually be at `https://YOUR-USERNAME.github.io/WEGYM/` (replace with your actual GitHub username and repository name).
7. Open that URL on your computer and phone and repeat the checklist above.
8. When you later configure Supabase, add your published URL under Supabase Authentication URL Configuration and use your public publishable/anon key in `js/supabase-config.js`. Never commit service_role/secret keys.

**Note:** GitHub Pages hosts static websites, not a backend. Supabase supplies authentication and cloud database services. The site can be deployed now with local-only tracking; cloud features activate only after Supabase setup.

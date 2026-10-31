# WEGYM Fitness Hub

Static HTML/CSS/JavaScript fitness website with six pages, workout video filtering, workout search, and completion tracking.

## Run locally
Open `index.html` in a browser, or use VS Code Live Server.

## Features
- Browse workout videos by body part
- Search exercises by name or category
- Mark individual workout videos completed and undo completion
- Completion progress is saved in your browser using `localStorage`
- Reset saved workout completion
- Workout plans, diets, equipment and supplement information

**Privacy:** Workout completion is stored only in the current browser, not in a server or user account. Clearing browser data will erase progress.

## Next steps
- Test on mobile and verify external video links
- Add dated workout sessions and workout history
- Deploy with GitHub Pages


## Prestige ranks (v2)
On Workout Videos, log an exercise after doing it. Each calendar day with at least one logged exercise counts as one workout day; three different workout days within a Monday–Sunday week qualify that week. Weeks do not have to be consecutive. Rank thresholds (qualifying weeks): Rookie 0, Bronze 1, Silver 2, Gold 4, Platinum 8, Diamond 12, Master 20, Black Diamond 32. Multiple exercises on the same day cannot accelerate weekly rank progress. You can undo today's exercise log; resetting deletes all v2 history. Stored in browser localStorage, not synchronized across devices. Earlier v1 one-time completions remain stored but cannot be converted to historical workout dates.

## Cloud accounts and cross-device prestige (Supabase)

Cloud sync requires your own **free Supabase project** and is not active until configured.

1. Go to https://supabase.com/dashboard and create a project.
2. In **SQL Editor**, paste and run `supabase-setup.sql`. It creates the workout log table and user-specific Row Level Security (RLS) policies.
3. Under **Project Settings → API** (or **Connect** in newer dashboards), copy the **Project URL** and **publishable/anon public key**.
4. Edit `js/supabase-config.js`: put your URL in `url` and your publishable/anon key in `anonKey`. **Never use the secret/service_role key in website code.**
5. In **Authentication → URL Configuration**, set the **Site URL** to your deployed website URL and add your development preview URL as a redirect URL if needed. In **Authentication → Providers → Email**, enable email/password. Email confirmation may be enabled by default.
6. Start a local web server (VS Code Live Server or `python -m http.server 8000`) and open `workout-videos.html`. Create an account, confirm the email if prompted, then sign in.
7. Log a workout. Sign in to the same account from another browser or device and verify the prestige progress appears. If you previously logged workouts locally, click **Import old browser progress** while signed in.

**How data works:** Without signing in, workouts stay in this browser's localStorage. When signed in, the database is the source of truth. Local history is not automatically merged; use the import button to merge it. Reset progress while signed in permanently deletes the account's cloud logs. Rank is calculated from workout dates (3 unique workout days per Monday–Sunday week), not stored separately.

**Security:** Supabase Auth handles passwords; this site does not store passwords in localStorage. RLS limits workout access to the signed-in account. The public key can be used in the browser because RLS protects data. Do not disable RLS. For a production launch, consider bot protection, password recovery, and a privacy policy.

**Testing:** JavaScript syntax was checked, but live account registration and database synchronization require your configured Supabase project and have not been end-to-end tested here.

## GitHub Pages deployment and testing
A GitHub Actions workflow is included at `.github/workflows/deploy.yml`.
See `TESTING-AND-DEPLOYMENT.md` for exact steps, test cases, limitations, and the checklist for going live.

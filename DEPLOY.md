# Firebase Version 3 deployment

1. In Firebase Authentication, enable Email/Password and create `admin@intrasquadleague.com`.
2. In Authentication > Settings > Authorized domains, add `diwakarsth.github.io`.
3. In Firestore > Rules, paste the contents of `firestore.rules` and click Publish.
4. Upload every extracted project file to the root of the GitHub repository and commit.
5. Wait for GitHub Pages deployment, then open the site in an Incognito window.
6. Sign in using the Firebase admin email/password. The first authorized login initializes `league/current` if it is empty.

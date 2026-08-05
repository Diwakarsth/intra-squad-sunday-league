# Intra Squad Sunday League v3.0 (Firebase)

This version uses Firebase Authentication and Cloud Firestore so admin changes are visible to all users in real time.

## Firebase setup

1. Enable Email/Password in Firebase Authentication.
2. Create the admin user `admin@intrasquadleague.com`.
3. Publish the Firestore rules from `firestore.rules`.
4. Upload all files in this folder to the root of the GitHub repository.

## Admin login

Use the password assigned to `admin@intrasquadleague.com` in Firebase Authentication. The password is not stored in the website files.

## Data location

Shared league data is stored in the Firestore document `league/current`. The document is created automatically after the authorized admin signs in for the first time.

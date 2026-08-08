# Gallery Setup

The Gallery supports two ways to add media.

## Option A — Media Link (works without Firebase Storage)
Admin can open **Gallery → Admin • Add Photos & Videos → Add Media Link** and paste:
- YouTube URL
- Direct image URL
- Direct video URL

This is the simplest option for large videos.

## Option B — Upload files directly
Direct uploads use Firebase Cloud Storage.

1. In Firebase Console, open **Storage**.
2. Enable/create Cloud Storage if available for your project.
3. Open **Storage → Rules**.
4. Replace the rules with the contents of `storage.rules` and publish.
5. Open **Firestore → Rules**.
6. Make sure the rules include the `matchMedia` block from `firestore.rules`.
7. Log in to the website as admin.
8. Open **Gallery**.
9. Choose the match, select photos/videos, and click **Upload Selected Files**.

Uploaded files are public to view, but only the authorized admin account can add/delete them.

## Important current Firebase requirement
As of 2026, Firebase requires the project to be on the Blaze pay-as-you-go plan to use Cloud Storage. No-cost usage quotas can still apply, but enabling billing is required. If you want to stay on a strictly no-billing setup, use the Media Link option for videos/photos.

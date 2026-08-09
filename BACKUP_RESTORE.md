# Admin Backup & Restore

## Download a backup
1. Log in as Admin.
2. Open Admin → Backup & Restore.
3. Click **Download League Backup**.
4. Keep the `.json` file somewhere safe (computer, Google Drive, etc.).

The backup includes all Firestore league data and Gallery records/URLs.

## Restore
1. Log in as Admin.
2. Choose the saved `.json` backup.
3. Click **Restore Selected Backup**.
4. Review the counts and confirm twice.

## Gallery photos
Cloudinary photo/video files themselves are not embedded into the JSON backup because that would make backups extremely large. The backup saves the media URL and Cloudinary public ID. As long as the asset still exists in Cloudinary, the restored Gallery photo will work normally.

For maximum safety, do not manually delete Cloudinary assets that you may need to restore later.

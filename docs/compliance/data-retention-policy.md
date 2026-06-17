# DATA RETENTION POLICY

## 1. Active Account Data

All data remains active and immutable while an organization account is in "Good Standing".

## 2. Soft Deletion Lifecycle

Upon workspace or account deletion:

- Day 0: Data marked `deletedAt = NOW()`. Access revoked.
- Day 30: BullMQ Background Job `prune-deleted-data` executes.

## 3. Hard Deletion Operations

- **Database**: Hard `DELETE` statements execute against Postgres.
- **S3 Objects**: `DeleteObjects` executed against Video Recordings, Thumbnails, and Transcripts.
- **Stripe**: Subscription canceled.

## 4. Backup Lifecycles

Database snapshots are retained for exactly **30 days**. Ergo, 60 days after user deletion, their data is mathematically irrecoverable across all persistence layers.

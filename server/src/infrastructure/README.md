Infrastructure modules will be introduced incrementally during migration:

- `prisma`: database client, repositories, transactions.
- `cache`: Redis cache abstractions.
- `queue`: background jobs and workers.
- `storage`: local, S3, R2, or Cloudinary adapters.

# Prisma Migration Notes

## Duplicate foreign key constraint

If Prisma generates SQL that attempts to recreate an existing foreign key
(e.g. Account_userId_fkey) during an unrelated schema change:

1. Inspect the generated migration.sql.
2. Remove the duplicate ALTER TABLE ... ADD CONSTRAINT statement if it is
   clearly recreating an existing foreign key.
3. Apply the migration.
4. Verify with:

npx prisma migrate status

Database schema is up to date.

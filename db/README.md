# Database Setup with Drizzle ORM and NeonDB

## Environment Variables

Add the following to your `.env.local` file:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Getting Your NeonDB Connection String

1. Go to [NeonDB Console](https://console.neon.tech/)
2. Create a new project or select an existing one
3. Navigate to the "Connection Details" section
4. Copy the connection string (it should look like: `postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)
5. Paste it into your `.env.local` file

## Installation

Install the required dependencies:

```bash
npm install
```

## Database Scripts

### Generate Migrations

Generate SQL migration files from your schema:

```bash
npm run db:generate
```

### Run Migrations

Apply migrations to your database:

```bash
npm run db:migrate
```

### Push Schema (Development)

Push schema changes directly to the database without generating migration files:

```bash
npm run db:push
```

**Note:** Use this for rapid development. For production, use `db:generate` and `db:migrate`.

### Drizzle Studio

Launch the Drizzle Studio GUI to view and edit your database:

```bash
npm run db:studio
```

This will open a web interface at `https://local.drizzle.studio`

## Schema Structure

The database schema is organized in the `db/schema/` directory:

- **`users.ts`** - User accounts with wallet addresses
- **`posts.ts`** - Blog posts or content created by users
- **`transactions.ts`** - Blockchain transactions with status tracking

## Usage Example

### Querying Data

```typescript
import { db } from "@/db";
import { users, posts, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

// Get all users
const allUsers = await db.select().from(users);

// Get user by wallet address
const user = await db
  .select()
  .from(users)
  .where(eq(users.walletAddress, "0x..."));

// Get user with their posts
const userWithPosts = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    posts: true,
    transactions: true,
  },
});
```

### Inserting Data

```typescript
// Insert a new user
const newUser = await db
  .insert(users)
  .values({
    walletAddress: "0x1234...",
    username: "john_doe",
    email: "john@example.com",
  })
  .returning();

// Insert a new post
const newPost = await db
  .insert(posts)
  .values({
    userId: user.id,
    title: "My First Post",
    content: "Hello, world!",
    slug: "my-first-post",
  })
  .returning();
```

### Updating Data

```typescript
// Update user profile
await db
  .update(users)
  .set({
    username: "new_username",
    updatedAt: new Date(),
  })
  .where(eq(users.id, userId));
```

### Deleting Data

```typescript
// Delete a post
await db.delete(posts).where(eq(posts.id, postId));
```

## Best Practices

1. **Always use transactions for related operations:**

```typescript
await db.transaction(async (tx) => {
  const user = await tx.insert(users).values({...}).returning();
  await tx.insert(posts).values({ userId: user[0].id, ... });
});
```

2. **Use prepared statements for repeated queries:**

```typescript
const getUserByWallet = db
  .select()
  .from(users)
  .where(eq(users.walletAddress, sql.placeholder("address")))
  .prepare();

const user = await getUserByWallet.execute({ address: "0x..." });
```

3. **Index frequently queried columns** (add to schema):

```typescript
export const users = pgTable("users", {
  // ... columns
}, (table) => ({
  walletAddressIdx: index("wallet_address_idx").on(table.walletAddress),
}));
```

## Troubleshooting

### Connection Issues

- Ensure your `DATABASE_URL` is correctly set in `.env.local`
- Verify your NeonDB project is active
- Check that your IP is allowed in NeonDB's security settings

### Migration Errors

- If migrations fail, check the generated SQL in `db/migrations/`
- You can manually edit migration files if needed
- Use `db:push` for quick schema updates during development

### Type Errors

- Run `npm run db:generate` to regenerate types after schema changes
- Restart your TypeScript server in your IDE

# Habitscape Backend

## How to Run the Backend

Follow these steps to set up and run the backend server locally:

1. **Install Dependencies:**
   Make sure you are in the `backend` directory, then install the required npm packages:
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Set up your environment variables. You will likely need a `.env` file with your database credentials (e.g., `DB_USER`, `DB_PASSWORD`, `DB_NAME`) and other secrets.

3. **Initialize the Database:**
   Apply the database schema to your PostgreSQL instance:
   ```bash
   npm run db:init
   ```

4. **Start the Server:**
   You can run the server in development mode (with auto-reload) or production mode:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Database Access (CLI)

The Habitscape backend uses **PostgreSQL**. To view and query the database via your terminal/command line, you can use the `psql` interactive terminal.

### Connecting to the Database

Run the following command in your terminal. Replace `postgres` with your actual database user, and `habitscape_db` with your actual database name if different:

```bash
psql -U postgres -d habitscape_db
```
*(You will be prompted to enter your PostgreSQL password)*

### Useful CLI Commands

Once you are connected to the `psql` shell, you can use these commands:

- `\d` - List all tables
- `\d food_logs` - View the structure of the `food_logs` table
- `\q` - Quit the interactive shell

### Example Queries

**Check all food logs:**
```sql
SELECT * FROM food_logs;
```

**Check recent uploads:**
```sql
SELECT id, meal_name, image_url, created_at 
FROM food_logs 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## FAQ

### Is the actual PNG/JPG data saved to the database?

**No.** 
Relational databases aren't ideal for storing large binary files like images. 

In the current MVP Snap Food flow:

1. The frontend keeps a temporary local preview of the selected image.
2. The backend receives the image in memory and forwards it to the FastAPI ML service.
3. The backend returns an unsaved nutrition draft to the frontend.
4. The database stores a `food_logs` row only after the user confirms the result.

Confirmed logs may have `image_url = null` because this MVP flow does not persist analyzed images.

# sql-mig8-cli

A lightweight, fast CLI tool for managing and running SQL migrations, built with [Bun](https://bun.sh/).

## Features

- 🚀 **Fast execution** powered by Bun.
- 📂 **Directory-based migrations**: Run all migrations from a specified directory (stateless).
- 📝 **Easy file creation**: Automatically generates timestamped migration files.
- 🐘 **SQL Support**: Designed for SQL (PostgreSQL, MySQL and SQLite) databases.

## Prerequisites

- [Bun](https://bun.sh/) (v1.0 or later)
- SQL database e.g PostgreSQL, MySQL or SQLite

## Installation

### Download Binary

You can download the pre-compiled binary for your operating system from the [Releases](https://github.com/irabeny89/bun-mig8-cli/releases) page.

### Build from Source

To build the standalone binary yourself, clone the repository and run:

```bash
bun install
bun run build # Builds for current platform
```

You can also build for specific platforms:

```bash
bun run build:linux-x64
bun run build:linux-arm64
bun run build:macos-x64
bun run build:macos-arm64
bun run build:windows-x64
```

The executables will be located in `dist/` with platform-specific suffixes (e.g., `dist/sqlmig8-linux-x64`).

## Configuration

The CLI relies on environment variables for configuration. Create a `.env` file in your project root or set these variables in your environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | The connection string for your SQL (PostgreSQL, MySQL or SQLite) database. | `postgres://user:password@localhost:5432/mydb` |
| `MIG_FOLDER` | The **relative path** (from root directory) to your migrations directory. | `src/migrations` |

## Usage

You can run the tool using `bun src/index.ts` (dev) or the built binary `sqlmig8`.

```bash
# Using Bun directly
bun src/index.ts [command]

# Using the binary (if built and in PATH)
bun run build,
mv dist/sqlmig8 /usr/local/bin
sqlmig8 [command]
```

### Commands

#### `help`

Displays the help message with available commands.

```bash
sqlmig8 help
```

#### `info`

Displays information about the current environment and configuration, including loaded environment variables.

```bash
sqlmig8 info
```

#### `check`

Checks the connection to the configured database.

```bash
sqlmig8 check
```

#### `create <description...>`

Creates a new migration file with a timestamp prefix in the configured `MIG_DIR_ABSOLUTE_PATH`.

```bash
# Creates a file like: 1704512345678-create-users-table.sql
sqlmig8 create 'create users table'
```

#### `migrate <file...>`

Runs specific migration file(s).

```bash
sqlmig8 migrate /path/to/migrations/1704512345678-create-users-table.sql
```

#### `dir`

Run all migrations found in the configured migration directory. Files are sorted by their timestamp prefix to ensure correct order.

**Note**: This tool is currently stateless and does not track which migrations have already been run. It will attempt to execute all SQL files in the directory. Ensure your migration scripts are idempotent (e.g., use `IF NOT EXISTS` or check for existence) or manage the file state manually.

```bash
sqlmig8 dir
```

## Migration File Format

Migration files are standard SQL files. The filename format is strictly:
`[timestamp]-[description].sql`

Example: `1689234123890-add_users.sql`

## Development

1. Clone the repository.
2. Install dependencies: `bun install`.
3. Set up your `.env` file (see Configuration).
4. Run tests: `bun test`.
5. Lint code: `bun run lint`.
6. Run the tool: `bun src/index.ts`.

## License

MIT

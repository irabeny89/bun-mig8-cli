import { version, bin } from "../package.json";

const wordSeparator = "-";
const binaryName = Object.keys(bin)[0];
let db: Bun.SQL | null = null;
const migFolder = process.env.MIG_FOLDER;

/**
 * Prints help message.
 */
export function printHelp() {
    console.log(`---Help---`);
    console.log("NOTE: SET THE DATABASE_URL AND MIG_FOLDER ENVIRONMENT VARIABLES");
    console.log(`MIG_FOLDER: The relative path (from root directory) to your migrations directory. \n\tE.g: src/migrations`);
    console.log(`DATABASE_URL: The connection string for your SQL (PostgreSQL, MySQL or SQLite) database. \n\tE.g: postgres://user:password@localhost:5432/mydb \n\tE.g: mysql://user:password@localhost:3306/mydb \n\tE.g: sqlite://path/to/database.db\n`);
    console.log(`Go to Bun.js docs for more info about environment variables - https://bun.com/docs/runtime/environment-variables\n`);
    console.log(`Usage: ${binaryName} [command]`);
    console.log(`Commands: help, info, create, migrate, dir, check`);
    console.log(`Example: ${binaryName} help`);
    console.log(`Example: ${binaryName} check`);
    console.log(`Example: ${binaryName} info`);
    console.log(`Example: ${binaryName} create <description> [description ...]`);
    console.log(`Example: ${binaryName} migrate <file> [file ...]`);
    console.log(`Example: ${binaryName} dir`);
    console.log(`---End Help---`);
}
/**
 * Prints information about the current environment.
 */
export function printInfo() {
    console.log(`---CLI Info---`);
    console.log(`${binaryName} version: ${version}`);
    console.log(`---System Info---`)
    console.log(`Bun version: ${Bun.version}`);
    console.log(`Node version: ${process.version}`);
    console.log(`OS: ${process.platform}`);
    console.log(`CPU: ${process.arch}`);
    console.log(`Memory: ${process.memoryUsage().rss / 1024 / 1024} MB`);
    console.log(`CPU Usage: ${process.cpuUsage().user / 1000000} ms`);
    console.log(`---Migration Info---`);
    console.log(`Migration directory: ${migFolder}`);
    console.log(`---Configuration---`);
    console.log(`Word separator: ${wordSeparator}`);
}

/**
 * Initializes/Retrieves the Bun SQL database connection as a singleton.
 * @returns Bun SQL instance
 */
export function dbSingleton() {
    if (!db) db = new Bun.SQL({ url: process.env.DATABASE_URL });
    return db;
}

/**
 * Transform string to a suitable name for files by trimming and swapping space between letters with hyphen.
 * @example "abc def" -> "abc-def"
 * @param suffix string to transform
 * @returns transformed string
 */
export function rename(suffix: string) {
    return suffix.trim().replace(/\s+/g, () => wordSeparator);
}

/**
 * Sort migration file names by attached number/timestamp prefix with hyphen separator in ascending order.
 *
 * This is usually used in Array.sort function for migration filenames of this format [timestamp]-[suffix].
 *
 * @example
 * const filenames = ["345-abs", "012-aaa"]
 * filenames.sort(getSortNumber) // -> ["012-aaa", "345-abs"]
 *
 * @param a first file name eg "345-abs"
 * @param b next file name eg "012-aaa"
 * @returns sort number
 */
export function getAscendingSortNumber(a: string, b: string) {
    const timestamp1 = a.split(wordSeparator)[0];
    const timestamp2 = b.split(wordSeparator)[0];
    if (!timestamp1 || !timestamp2) throw new Error("Invalid file name");
    return parseInt(timestamp1) - parseInt(timestamp2);
}

/**
 * Creates a new migration file in the specified directory.
 * @param description Description of the migration.
 * @returns Path to the created migration file.
 */
export async function createMigrationFile(description: string) {
    const migDir = process.env.MIG_DIR_ABSOLUTE_PATH
    if (!migDir) throw new Error("MIG_DIR_ABSOLUTE_PATH environment variable is not set");
    const timestamp = Date.now();
    const filename = `${timestamp}${wordSeparator}${rename(description)}.sql`;
    const filePath = `${migDir}/${filename}`;
    await Bun.write(filePath, "");
    return filePath;
}

/**
 * Logs a message to the console with a specified log level.
 * @param msg The message to log.
 * @param level The log level (INFO, ERROR, WARN, DEBUG).
 */
export function log(msg: string, level: "INFO" | "ERROR" | "WARN" | "DEBUG" = "INFO") {
    console.log(`${level}: ${msg}`);
}

/**
 * Runs a migration file.
 * @param filepath Path to the migration file.
 */
export async function migrate(filepath: string) {
    const sql = dbSingleton();
    await sql.file(filepath);
}

/**
 * Runs all migration files in the specified directory.
 */
export async function migrateDirectory() {
    const migDir = process.env.MIG_DIR_ABSOLUTE_PATH
    if (!migDir) throw new Error("MIG_DIR_ABSOLUTE_PATH environment variable is not set");
    const { readdir } = await import("node:fs/promises");
    const files = await readdir(migDir);
    files.sort(getAscendingSortNumber);
    log(`migrating directory (${files.length} files): ${migDir}`);
    for (const file of files) {
        log(`migrating ${file}`);
        await migrate(`${migDir}/${file}`)
            .catch((e) => {
                log(`Failed to migrate ${file}`, "ERROR");
                console.error(e);
                process.exit(1);
            });
        log(`migrated ${file}`);
    }
}

export async function checkDbConnection() {
    await dbSingleton()`SELECT 1`;
}
import { log, createMigrationFile, printInfo, migrate, migrateDirectory, printHelp, checkDbConnection } from "./utils";

const [command, ...args] = Bun.argv.slice(2);

// MARK: - no command
if (!command) {
	log("no command provided", "ERROR");
	printHelp();
	process.exit(1);
}
// MARK: help
if (command === "help") {
	printHelp();
	process.exit(0);
}
// MARK: check
if (command === "check") {
	await checkDbConnection()
		.catch((e) => {
			log("Failed to connect to database", "ERROR");
			console.error(e);
			process.exit(1);
		});
	log(`connected to database`);
	process.exit(0);
}
// MARK: info
if (command === "info") {
	printInfo();
	process.exit(0);
}
// MARK: create
if (command === "create") {
	if (args.length === 0) {
		log("no migration description provided", "ERROR");
		printHelp();
		process.exit(1);
	}
	log(`creating ${args.length} migration files`);
	for (const arg of args) {
		const path = await createMigrationFile(arg);
		log(`created migration file: ${path}`);
	}
	log(`created ${args.length} migration files`);
	process.exit(0);
}
// MARK: migrate
if (command === "migrate") {
	if (args.length === 0) {
		log("no migrations to run", "ERROR");
		printHelp();
		process.exit(1);
	}
	log(`running ${args.length} migrations`);
	for (const arg of args) {
		await migrate(arg)
			.catch((e) => {
				log(`Failed migration: ${arg}`, "ERROR");
				console.error(e);
				process.exit(1);
			});
		log(`ran migration: ${arg}`);
	}
	log(`ran ${args.length} migrations`);
	process.exit(0);
}
// MARK: dir
if (command === "dir") {
	log("running all migrations in directory")
	await migrateDirectory()
		.catch((e) => {
			log("Failed to run migrations", "ERROR");
			console.error(e);
			process.exit(1);
		});
	log(`migrations completed successfully`);
	process.exit(0);
}

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function main() {
	const db = await open({
		filename: './src/selfstats.db',
		driver: sqlite3.Database
	});
	await db.run('CREATE TABLE IF NOT EXISTS data (email TEXT PRIMARY KEY, data BLOB)');
}

main();

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const db = await open({
	filename: './src/selfstats.db', // Specify the database file
	driver: sqlite3.Database
});

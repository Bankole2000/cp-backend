import Loki from 'lokijs';

const db = new Loki('lokidb.json');

db.loadDatabase();

export { db };

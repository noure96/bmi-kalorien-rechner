const fs = require('fs');
const crypto = require('crypto');

const USERS_FILE = './node/users.json';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

const newPassword = '123456'; // ← HIER ändern
users.admin.password = hashPassword(newPassword);

fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

console.log('✅ Passwort neu gesetzt für admin');

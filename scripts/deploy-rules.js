/**
 * Run this ONCE to deploy open Firestore + Storage rules:
 *
 *   node scripts/deploy-rules.js
 *
 * Requires: npm install -g firebase-tools  AND  firebase login
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

const STORAGE_RULES = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}`;

writeFileSync('firestore.rules', FIRESTORE_RULES);
writeFileSync('storage.rules', STORAGE_RULES);

console.log('Deploying Firestore and Storage rules...');
execSync('firebase deploy --only firestore:rules,storage', { stdio: 'inherit' });
console.log('Done!');

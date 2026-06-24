#!/usr/bin/env node
/**
 * One-time Firebase setup script.
 * Deploys open Firestore + Storage rules so admin ↔ website sync works.
 *
 * Run once:  node scripts/setup-firebase.js
 * Requires:  npm install -g firebase-tools  +  firebase login
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
console.log('✓ Rules files written');

try {
  execSync('firebase deploy --only firestore:rules,storage', { stdio: 'inherit' });
  console.log('\n✓ Firebase rules deployed successfully!');
  console.log('  Admin edits will now sync to the website in real-time.\n');
} catch {
  console.error('\n✗ Deploy failed. Make sure you have run:');
  console.error('    npm install -g firebase-tools');
  console.error('    firebase login');
  console.error('    firebase use cake-paradise-969e6\n');
}

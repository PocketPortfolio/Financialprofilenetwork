#!/usr/bin/env node
/**
 * Prints a one-time random value for PLAYBOOK_GATE_SECRET (Vercel / local).
 * Do not commit the output. Share only with trusted internal users.
 */
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('base64url');
console.log('');
console.log('Add this in Vercel → Settings → Environment Variables:');
console.log('');
console.log('  Name:  PLAYBOOK_GATE_SECRET');
console.log(`  Value: ${secret}`);
console.log('');
console.log('Redeploy after saving. Team enters this same value once at the playbook gate.');
console.log('');

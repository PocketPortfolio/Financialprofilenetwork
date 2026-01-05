# NPM Publishing Guide

## Prerequisites

You need to be logged into NPM to publish packages.

### Step 1: Login to NPM

Run this command in your terminal:

```bash
npm login
```

You'll be prompted for:
- Username
- Password
- Email
- OTP (if 2FA is enabled)

### Step 2: Verify Login

```bash
npm whoami
```

Should display your NPM username.

### Step 3: Publish Packages

Once logged in, you can publish all packages using:

```bash
npm run publish-aliases
```

Or publish individually:

```bash
# Package 1: Robinhood
cd packages/aliases/robinhood-csv-parser
npm publish --access public

# Package 2: eToro
cd ../etoro-history-importer
npm publish --access public

# Package 3: Trading212
cd ../trading212-to-json
npm publish --access public

# Package 4: Fidelity
cd ../fidelity-csv-export
npm publish --access public

# Package 5: Coinbase
cd ../coinbase-transaction-parser
npm publish --access public
```

## Alternative: Using NPM Token (Non-Interactive)

If you have an NPM access token, you can set it as an environment variable:

```bash
# Windows PowerShell
$env:NPM_TOKEN="your-token-here"

# Then publish
npm publish --access public --//registry.npmjs.org/:_authToken=$env:NPM_TOKEN
```

To create an NPM token:
1. Go to https://www.npmjs.com/settings/[username]/tokens
2. Click "Generate New Token"
3. Select "Automation" or "Publish" type
4. Copy the token

## Verification

After publishing, test in a clean directory:

```bash
mkdir test-install
cd test-install
npm init -y
npm install robinhood-csv-parser
```

You should see the terminal ad appear!

## Troubleshooting

### Error: "Package name already exists"
- The package name is taken
- Solution: Use scoped package: `@pocket-portfolio/robinhood-csv-parser`
- Update `package.json` name field

### Error: "ENEEDAUTH"
- Not logged in
- Solution: Run `npm login`

### Error: "EPERM" or permission errors
- Insufficient permissions
- Solution: Check you own the package name or use a scoped package




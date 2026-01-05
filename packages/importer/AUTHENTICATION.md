# NPM Authentication Guide

## Option 1: Browser Login (Interactive)

1. Run: `npm login`
2. Press ENTER when prompted to open browser
3. Complete login in browser
4. Return to terminal - you'll be authenticated

## Option 2: Access Token (Recommended for Automation)

### Step 1: Create Token on npmjs.com
1. Go to: https://www.npmjs.com/settings/[your-username]/tokens
2. Click "Generate New Token"
3. Select "Automation" token type
4. Copy the token (starts with `npm_`)

### Step 2: Create .npmrc file
Create `.npmrc` in `packages/importer/` with:
```
//registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE
```

### Step 3: Publish
```bash
npm publish --access public
```

## Option 3: Use Existing Token
If you already have a token, just create the `.npmrc` file with it.










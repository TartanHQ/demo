# Quick Fix for Build Error

## The Issue
The build error occurs because the Radix UI packages need to be installed. They are already listed in `package.json` but not yet installed in `node_modules`.

## Solution

**Run this command in your terminal:**

```bash
npm install
```

This will install all dependencies including:
- `@radix-ui/react-checkbox`
- `@radix-ui/react-dialog`

## Alternative: Install Only Missing Packages

If you prefer to install only the missing packages:

```bash
npm install @radix-ui/react-checkbox @radix-ui/react-dialog
```

## After Installation

1. **Verify the build works:**
   ```bash
   npm run build
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

## For Vercel Deployment

When you deploy to Vercel, it will automatically run `npm install` during the build process, so the dependencies will be installed automatically. You just need to make sure `package.json` has the dependencies listed (which it does).

## Verification

After running `npm install`, you should see:
- `node_modules/@radix-ui/react-checkbox/` directory
- `node_modules/@radix-ui/react-dialog/` directory

The build error will be resolved once these packages are installed.

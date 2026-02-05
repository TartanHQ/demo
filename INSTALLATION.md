# Installation Instructions

## Fix Build Error

The build error is due to missing Radix UI dependencies. Please run:

```bash
npm install @radix-ui/react-checkbox @radix-ui/react-dialog
```

Or if you prefer to install all dependencies fresh:

```bash
npm install
```

## After Installation

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Deploy to Vercel:**
   - Push to GitHub
   - Connect repository to Vercel
   - Vercel will automatically detect Next.js and install dependencies
   - Deploy

## Note

All dependencies are already listed in `package.json`. The build error will be resolved once you run `npm install` to install the missing packages.

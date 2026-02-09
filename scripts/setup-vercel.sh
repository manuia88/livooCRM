#!/bin/bash
set -euo pipefail

echo "Setting up Vercel project..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
fi

# Login to Vercel
echo "Logging in to Vercel..."
vercel login

# Link project
echo "Linking project to Vercel..."
vercel link

# Add environment variables for production
echo ""
echo "Adding production environment variables..."
echo "You will be prompted for each value."
echo ""

for VAR in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY DATABASE_URL; do
  echo "--- $VAR (production) ---"
  vercel env add "$VAR" production
done

# Add environment variables for preview
echo ""
echo "Adding preview environment variables..."
echo ""

for VAR in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY DATABASE_URL; do
  echo "--- $VAR (preview) ---"
  vercel env add "$VAR" preview
done

echo ""
echo "Vercel setup complete!"
echo ""
echo "Next steps - add these GitHub Secrets:"
echo "  VERCEL_TOKEN       - Vercel Settings > Tokens"
echo "  VERCEL_ORG_ID      - Vercel Settings > General"
echo "  VERCEL_PROJECT_ID  - Project Settings > General"
echo ""
echo "Add them at: GitHub repo > Settings > Secrets and variables > Actions"

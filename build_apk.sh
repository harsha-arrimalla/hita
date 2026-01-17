#!/bin/bash

# 1. Set up the correct Node environment (Using the path we know works)
export PATH=/Users/harsha/.nvm/versions/node/v20.19.6/bin:$PATH

# 2. Print status
echo "🚀 Hita Build System: Starting APK Build..."
echo "ℹ️  If asked, log in with: harshavirat51@gmail.com"

# 3. Run the build
# -p android: Platform Android
# --profile preview: Use the profile we defined in eas.json for APKs
npx eas-cli build -p android --profile preview

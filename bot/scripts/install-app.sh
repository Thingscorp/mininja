#!/bin/sh
# Wrap Mininja as a double-clickable macOS app that starts the local server.
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$HOME/Applications/Mininja.app"
mkdir -p "$HOME/Applications" "$APP/Contents/MacOS" "$APP/Contents/Resources"

cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Mininja</string>
  <key>CFBundleDisplayName</key><string>Mininja</string>
  <key>CFBundleIdentifier</key><string>com.thingscorp.mininja.bot</string>
  <key>CFBundleVersion</key><string>1.0</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleExecutable</key><string>Mininja</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>LSMinimumSystemVersion</key><string>12.0</string>
  <key>NSHighResolutionCapable</key><true/>
</dict>
</plist>
PLIST

cat > "$APP/Contents/MacOS/Mininja" <<EOF
#!/bin/sh
export PATH="\$HOME/.local/bin:\$HOME/.grok/bin:/usr/local/bin:/opt/homebrew/bin:\$PATH"
export PYTHONUNBUFFERED=1
cd "$ROOT"
exec /usr/bin/python3 "$ROOT/server.py" --open
EOF
chmod +x "$APP/Contents/MacOS/Mininja"

if command -v qlmanage >/dev/null 2>&1; then
  tmp="$(mktemp -d)"
  qlmanage -t -s 256 -o "$tmp" "$ROOT/static/favicon.svg" >/dev/null 2>&1 || true
  if ls "$tmp"/*.png >/dev/null 2>&1; then
    cp "$tmp"/*.png "$APP/Contents/Resources/AppIcon.png"
  fi
  rm -rf "$tmp"
fi

echo "installed $APP"
echo "open with: open \"$APP\""

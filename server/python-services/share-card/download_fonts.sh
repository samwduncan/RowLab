#!/bin/bash
# Download IBM Plex fonts from Google Fonts mirror
# Google Fonts provides direct .ttf downloads without GitHub redirect issues

set -e

cd "$(dirname "$0")/fonts"

echo "Downloading IBM Plex Sans fonts from Google Fonts..."

# IBM Plex Sans - Regular, SemiBold, Bold
curl -L -o IBMPlexSans-Regular.ttf "https://github.com/google/fonts/raw/main/ofl/ibmplexsans/IBMPlexSans-Regular.ttf"
curl -L -o IBMPlexSans-SemiBold.ttf "https://github.com/google/fonts/raw/main/ofl/ibmplexsans/IBMPlexSans-SemiBold.ttf"
curl -L -o IBMPlexSans-Bold.ttf "https://github.com/google/fonts/raw/main/ofl/ibmplexsans/IBMPlexSans-Bold.ttf"

echo "Downloading IBM Plex Mono fonts from Google Fonts..."

# IBM Plex Mono - Regular, Bold
curl -L -o IBMPlexMono-Regular.ttf "https://github.com/google/fonts/raw/main/ofl/ibmplexmono/IBMPlexMono-Regular.ttf"
curl -L -o IBMPlexMono-Bold.ttf "https://github.com/google/fonts/raw/main/ofl/ibmplexmono/IBMPlexMono-Bold.ttf"

echo "Fonts downloaded successfully:"
ls -1 *.ttf

#!/bin/bash

# Compress client side resources
python scripts/minifier/minifier.py -v -c scripts/minifier.conf

# Build JS docs
./naturaldocs/NaturalDocs/NaturalDocs -i static/js -xi static/js/libs -o HTML docs/js -p docs/js_config

# Build Python docs
mkdir modules
./scripts/sphinx-autopackage-script/generate_modules.py --dest-dir=modules -f -s rst ./
sphinx-build -b html ./ ./docs/_build/
rm -r modules
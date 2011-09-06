#!/bin/bash

# Compress client side resources
echo "========= MINIFY JS AND CSS ============"
python scripts/minifier/minifier.py -v -c scripts/minifier.conf --force

# Build JS docs
echo "========= JS DOCS ============"
./naturaldocs/NaturalDocs/NaturalDocs -i static/js -xi static/js/libs -o HTML docs/js -p docs/js_config

# Build Python docs
echo "========= PYTHON DOCS ============"
mkdir modules
./scripts/sphinx-autopackage-script/generate_modules.py --dest-dir=modules -f -s rst ./
sphinx-build -b html ./ ./docs/_build/
rm -r modules

# Models.sql reminder
echo "========= MODELING ============"
echo "Ensure that the models.sql file is up to date, and that all the migration"
echo "scripts are working.  See 'Regenerating models.sql' on the wiki at"
echo "https://github.com/codeforamerica/cbu/wiki/Data-and-Schema-Migrations for"
echo "instructions on how to do this."
echo ""

# Release notes
echo "========= UPDATE DOCS ============"
echo "Make sure the following are up to date: CHANGELOG.txt, UPGRADE.txt, README.txt, INSTALL.txt"

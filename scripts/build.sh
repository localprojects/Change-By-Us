#!/bin/bash

# Compress client side resources
echo "========= MINIFY JS AND CSS ============"
python scripts/minifier/minifier.py -v -c scripts/minifier.conf

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
echo "Ensure that the models.sql file is up to date with something similar to:"
echo "mysqldump --no-data -u USER_NAME -p DB_NAME | sed 's/\(.*ENGINE.*AUTO_INCREMENT=\).*/\10;/g' > sql/models-temp.sql"
echo ""
echo "Also make sure migrations scripts are created."

# Release notes
echo "========= UPDATE DOCS ============"
echo "Make sure the following are up to date: CHANGELOG.txt, UPGRADE.txt, README.txt, INSTALL.txt"
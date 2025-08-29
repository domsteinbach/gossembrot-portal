#!/bin/bash

# First argument: Environment name ('test-server' or 'production')

if [ "$1" = "production" ]; then
  cp src/.htaccess dist/gossembrot-db/.htaccess
elif [ "$1" = "test-server" ]; then
  cp src/.htaccess.test dist/gossembrot-db_test/.htaccess
elif [ "$1" = "static-apache"  ]; then
  cp src/.htaccess.static-apache dist/gossembrot-db_static-apache/.htaccess
else
  echo "Unknown environment: $1"
fi
echo "Copied .htaccess for $1 environment"

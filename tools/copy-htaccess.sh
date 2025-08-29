#!/bin/bash

if [ "$1" = "production" ]; then
  cp src/.htaccess dist/gossembrot-portal/.htaccess
elif [ "$1" = "test-server" ]; then
  cp src/.htaccess.test dist/gossembrot-portal_test/.htaccess
elif [ "$1" = "static-apache"  ]; then
  cp src/.htaccess.static-apache dist/gossembrot-portal_static/.htaccess
else
  echo "Unknown environment: $1"
fi
echo "Copied .htaccess for $1 environment"

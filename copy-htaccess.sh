#!/bin/bash

# First argument: Environment name ('test-server' or 'production')

if [ "$1" = "production" ]; then
  cp src/.htaccess dist/gossembrot-db/.htaccess
elif [ "$1" = "test-server" ]; then
  cp src/.htaccess.test dist/gossembrot-db_test/.htaccess
fi

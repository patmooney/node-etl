#!/bin/sh
set -xe
sleep 5;
./data/seed.sh
node index.js

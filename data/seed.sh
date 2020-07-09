set -xe
psql -h database -U postgres -f "./data/seed/0-create.sql"

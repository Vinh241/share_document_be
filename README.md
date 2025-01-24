- Backup full database 
# For running database
npm run db:backup

# Or directly using docker
docker-compose exec postgres pg_dump -U postgres document_sharing > ./backups/backup_$(date +%Y%m%d_%H%M%S).sql

- Backup only data 
# For running database
npm run db:backup:data

# Or directly using docker
docker-compose exec postgres pg_dump -U postgres --data-only document_sharing > ./backups/backup_data_$(date +%Y%m%d_%H%M%S).sql

# To restore a backup:
- Replace backup_file.sql with your backup file name
docker-compose exec -T postgres psql -U postgres document_sharing < ./backups/backup_file.sql
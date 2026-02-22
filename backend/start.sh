#!/bin/bash

# Run migrations
php artisan migrate --force

# Start php-fpm in background and nginx in foreground
php-fpm -y /assets/php-fpm.conf &
nginx -c /etc/nginx/nginx.conf

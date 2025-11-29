#!/bin/bash
# Wrapper script to run docker compose with proper group permissions
exec sg docker -c "docker compose -f docker-compose.dev.yml $*"




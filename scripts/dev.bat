:start
call git checkout dev
call git pull
call npm run bot
echo "Restarting in ten seconds..."
timeout 5 > NUL
timeout 5 > NUL
GOTO start
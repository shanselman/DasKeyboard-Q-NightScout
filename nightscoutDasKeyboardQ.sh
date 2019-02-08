#!/bin/sh
# This script colorize all LEDs of a 5Q keyboard
# by sending JSON signals to the Q desktop public API.
# based on Blood Sugar values from Nightscout
set -e # quit on first error.
PORT=27301

# Colorize the 5Q keyboard
PID="DK5QPID" # product ID

# Zone are LED groups. There are less than 166 zones on a 5Q.
# This should cover the whole device.
MAX_ZONE_ID=166

# Get blood sugar from Nightscout as TEXT
red=#f00
green=#0f0
yellow=#ff0
#deep orange is LOW sugar
COLOR=#f50 
bgvalue=$(curl -s  https://hanselsugars.azurewebsites.net/api/v1/entries.txt?count=1 | grep -Eo '000\s([0-9]{1,3})+\s' | cut -f 2)
if [ $bgvalue -gt 80 ]
then 
    COLOR=$green
    if [ $bgvalue -gt 140 ]
    then
        COLOR=$yellow
        if [ $bgvalue -gt 200 ]
        then
            COLOR=$red
        fi
    fi
fi

echo "Sugar is $bgvalue and color is $COLOR!"

for i in `seq $MAX_ZONE_ID`
do
    #echo "Sending signal to zoneId: $i"
    # important NOTE: if field "name" and "message" are empty then the signal is
    # only displayed on the devices LEDs, not in the signal center
    curl -s -S --output /dev/null -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{
        "name": "Nightscout",
        "id": "'$i'",
        "message": "Blood sugar is '$bgvalue'",
        "pid": "'$PID'",
        "zoneId": "'"$i"'",
        "color": "'$COLOR'",
        "effect": "SET_COLOR"
       
    }' "http://localhost:$PORT/api/1.0/signals"

done
echo "\n\nDone.\n\n\n"
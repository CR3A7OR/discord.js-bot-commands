while true
do
    vcgencmd measure_temp > logfile
    sleep 10
done

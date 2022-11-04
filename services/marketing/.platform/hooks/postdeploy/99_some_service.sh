#!/usr/bin/env bash
sudo cp /tmp/proxy.conf /etc/nginx/conf.d/elasticbeanstalk/
sudo rm -f /etc/nginx/conf.d/elasticbeanstalk/00_application.conf
sudo systemctl restart nginx
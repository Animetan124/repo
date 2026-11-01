#!/bin/sh
# Установка панели на Raspberry Pi. Запуск: sh setup-pi.sh (из папки ~/station-panel)
set -e
cd "$(dirname "$0")"
sudo apt update
sudo apt install -y nodejs npm
npm install --omit=dev

printf 'Придумайте пароль панели (ввод скрыт): '
stty -echo; read PW; stty echo; echo
[ -n "$PW" ] || { echo 'Пароль не может быть пустым'; exit 1; }
echo "PANEL_PASSWORD=$PW" | sudo tee /etc/station-panel.env >/dev/null
sudo chmod 600 /etc/station-panel.env

sed "s|__USER__|$(id -un)|; s|__DIR__|$(pwd)|" station-panel.service > /tmp/station-panel.service
sudo cp /tmp/station-panel.service /etc/systemd/system/station-panel.service
sudo systemctl daemon-reload
sudo systemctl enable --now station-panel
sleep 2
systemctl is-active station-panel
echo "Готово. Откройте http://$(hostname -I | awk '{print $1}'):3100  (логин: admin)"

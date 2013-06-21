set -e

if ! (which node); then
  sudo apt-get install -qq python-software-properties
  sudo add-apt-repository --yes ppa:chris-lea/node.js
  sudo apt-get update
  apt-get install -qq nodejs
fi
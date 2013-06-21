execute "sudo apt-get update" do
  action :nothing
end.run_action(:run)

execute "install newer ruby" do
  command(<<-CMD)
  set -e

  sudo apt-get install -qq python-software-properties
  if ! (ruby -e "exit(RUBY_VERSION == '1.9.3')"); then
    sudo add-apt-repository --yes ppa:brightbox/ruby-ng
    sudo apt-get update
    sudo apt-get install -qq passenger-common1.9.1
    sudo apt-get install -qq ruby rubygems ruby-switch
    sudo apt-get install -qq ruby1.9.3
    sudo ruby-switch --set ruby1.9.1
  fi
  CMD
  action :nothing
end.run_action(:run)

ohai "reload" do
  action :reload
end

package "libxslt-dev"
package "libxml2-dev"
package "imagemagick"

include_recipe "rails-template"

include_recipe "build-essential"

package "git" do
  action :install
end

shared_dir = node[:vagrant][:config][:keys][:vm][:shared_folders]["v-root"][:guestpath]

include_recipe "postgresql::server"

execute "create pg admin user" do
  command <<-CMD
    if ! ( psql postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='#{node[:postgres][:admin]}'" | grep 1 ); then
      createuser -s #{node[:postgres][:admin]}
    fi
  CMD

  user "postgres"
end

node[:postgresql][:databases].each do |db_name|
  host_uname = "--host=localhost --username=#{node[:postgres][:admin]}"

  execute "create db #{db_name}" do
    command <<-CMD
    if ! ( psql #{host_uname} --list | grep #{db_name} ); then
      createdb #{host_uname} #{db_name}
    fi
    CMD

    user "postgres"
  end
end


# NOTE this is only relevant for local development environments (ie Vagrant)
#      as the plan is to deploy to heroku which will provide the db config
if node[:instance_role] == "vagrant"
  template "#{shared_dir}/config/database.yml" do
    source "database.yml.erb"
  end
end

package "redis-server" do
  action :install
end

service "redis-server" do
  action [:enable, :start]
end

include_recipe "passenger_apache2::mod_rails"

execute "install js runtime" do
  command(<<-CMD)
  set -e

  if ! (which node); then
    sudo apt-get update
    sudo add-apt-repository --yes ppa:chris-lea/node.js
    apt-get install -qq nodejs
  fi
  CMD
  cwd shared_dir
end

#execute "gem update --system" do
#  command "gem update --system"
#  cwd shared_dir
#end

gem_package "bundler" do
  gem_binary("/usr/bin/gem")
end

execute "bundle install" do
  command "bundle install --without local_development"
  cwd shared_dir
end

execute "migrate and seed" do
  command "bundle exec rake db:migrate && bundle exec rake db:seed"
  cwd shared_dir
end

web_app "project" do
  docroot shared_dir + "/public"
  server_name "project"
  server_aliases [ "project", node[:hostname] ]

  if node[:instance_role] == "vagrant"
    rails_env "development"
  else
    rails_env "production"
  end
end

file "/etc/apache2/sites-enabled/000-default" do
  action :delete
end

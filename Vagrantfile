# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant::Config.run do |config|
  config.vm.box = "precise64"
  config.vm.box_url = "http://files.vagrantup.com/precise64.box"
  config.vm.customize ["modifyvm", :id, "--memory", 1024]

  config.vm.network(:hostonly, "21.21.21.21")
  config.vm.forward_port 80, 8088
  config.vm.forward_port 22, 2255

  if !(RbConfig::CONFIG['host_os'] =~ /mswin32/)
    config.vm.share_folder("v-root", "/vagrant", ".", :nfs => true)
  end

  config.vm.provision :chef_solo do |chef|
    chef.cookbooks_path = "vendor/cookbooks"
    chef.add_recipe "project"

    # You may also specify custom JSON attributes:
    chef.json = { :postgres => { :admin => "admin" }}
  end
end

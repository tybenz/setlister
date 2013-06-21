# Rails Template

This repository contains files that can be merged into a newly generated rails project to assist in setting up a development environment that emulates Heroku with Vagrant.

## Dependencies

This template assumes that Vagrant (>=1.0.1) and Virtualbox (>=4.1.10) are installed.

## Usage

For a new rails project perform the following:

    # generate the new project, avoid running the bundle install, and fix hash conflicts
    rails new foo --skip-bundle
    cd foo

    # remove the suggest db config it's supplied by the cookbooks
    rm config/database.yml

    # create the initial commit
    git init
    git add .
    git commit -m "initial commit"

    # add the rails template repo and pull the code in
    git remote add rails-template git@git.corp.adobe.com:prolab/rails-template.git
    git fetch rails-template
    git merge -Xtheirs rails-template/master


Once that's complete make sure to `git push` the resulting changes to origin so others have access and then all team members can simply issue:

    vagrant up

To build the development environment. At which point the Rails default page will be available at [http://33.33.33.10/](http://33.33.33.10/) (see the Vagrantfile for ip config).

## Important

Make sure that you either generate the new Rails project with `--old-style-hash` or while using ruby 1.8.7 to prevent conflicts inside the vm (Vagrant base boxes run 1.8.7 by default).

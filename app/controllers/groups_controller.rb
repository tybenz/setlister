class GroupsController < ApplicationController
  respond_to :html, :json

  def new
    @group = Group.new
  end

  def create
    group_params = params[:group]
    @group = Group.new group_params
    @group.users << current_user

    if @group.save
      respond_with @group
    else
      redirect_to new_groups_path
    end
  end

  def show
    @group = Group.where("lower(name) = ?", params[:id].gsub( /_/, ' ' ).downcase).first
  end
end

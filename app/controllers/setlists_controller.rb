class SetlistsController < ApplicationController
  before_filter :is_admin, :except => [:index, :show]

  respond_to :html, :json

  def new
    @setlist = Setlist.new

    respond_with @setlist
  end

  def create
    @setlist = Setlist.create(params[:setlist])

    respond_with @setlist
  end

  def edit
    @setlist = Setlist.find(params[:id])

    respond_with @setlist
  end

  def update
    @setlist = Setlist.find(params[:id])
    @setlist.update_attributes(params[:setlist])

    respond_with @setlist
  end

  def index
    @setlists = Setlist.order("created_at DESC")

    respond_with @setlists
  end

  def show
    @setlist = Setlist.find(params[:id])

    respond_with @setlist
  end

  def destroy
    @setlist = Setlist.find(params[:id])

    @setlist.destroy

    redirect_to setlist_path(@setlist)
  end

  private
  def is_admin
    if !signed_in? || !current_user.admin?
      flash[:notice] = "You have to be an admin to do that."
      redirect_to root_path
    end
  end
end

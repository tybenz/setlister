require 'open-uri'
class SetlistsController < ApplicationController
  before_filter :is_admin, :except => [:index, :show, :slideshow]
  before_filter :get_backgrounds, :only => [:slideshow]
  before_filter :group

  respond_to :html, :json

  def new
    @setlist = Setlist.new

    respond_with @setlist
  end

  def create
    @setlist = Setlist.create(params[:setlist])

    redirect_to group_setlists_path(@group)
  end

  def edit
    @setlist = Setlist.find(params[:id])

    respond_with @setlist
  end

  def update
    @setlist = Setlist.find(params[:id])
    @setlist.update_attributes(params[:setlist])

    redirect_to group_setlist_path(@group, @setlist)
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

    redirect_to group_setlists_path(@group)
  end

  def slideshow
    @setlist = Setlist.find(params[:id])
    @full = params[:full]

    render :slideshow, :layout => "empty"
  end

  private
  def is_admin
    if !signed_in? || !current_user.admin?
      flash[:notice] = "You have to be an admin to do that."
      redirect_to root_path
    end
  end

  def get_backgrounds
    @backgrounds = []
    Dir.foreach('app/assets/images/ss-backgrounds') do |fname|
      if fname != '..' && fname != '.'
        @backgrounds << fname
      end
    end
  end

  def group
    @group = Group.where("lower(name) = ?", params[:group_id].downcase).first
  end
end

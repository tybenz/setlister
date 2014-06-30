class SongsController < ApplicationController
  before_filter :is_admin, :except => [:index, :show]
  before_filter :group

  respond_to :html, :json

  def new
    @song = Song.new

    respond_with @song
  end

  def create
    @song = Song.new(params[:song])

    if @song.save
      redirect_to group_song_path(@group, @song)
    else
      redirect_to new_song_path
    end
  end

  def show
    @song = Song.find(params[:id])

    respond_with @song
  end

  def index
    @songs = Song.order(:title)
    @setlists = Setlist.order("created_at DESC")

    respond_with @songs
  end

  def edit
    @song = Song.find(params[:id])

    respond_with @song
  end

  def update
    @song = Song.find(params[:id])

    if @song.update_attributes(params[:song])
      redirect_to group_song_path(@group, @song)
    else
      redirect_to edit_song_path(@song)
    end
  end

  def destroy
    @song = Song.find(params[:id])

    @song.destroy

    redirect_to group_songs_path(@group)
  end

  private
  def is_admin
    if !signed_in? || !current_user.admin?
      flash[:notice] = "You have to be an admin to do that."
      redirect_to root_path
    end
  end

  def group
    @group = Group.where("lower(name) = ?", params[:group_id].downcase).first
  end
end

class SetlistSongsController < ApplicationController
  before_filter :is_admin
  respond_to :html, :json

  def create
    @setlist_song = SetlistSong.new(params[:setlist_song])
    @setlist = Setlist.find(params[:setlist_song][:setlist_id])
    last_song = @setlist.setlist_songs.order("position ASC").last
    if last_song
      @setlist_song.position = ( last_song.position ? last_song.position : 0 ) + 1
    end

    @setlist_song.save

    respond_with @setlist_song
  end

  def destroy
    @setlist_song = SetlistSong.find(params[:id])

    setlist = @setlist_song.setlist
    @setlist_song.destroy

    # renumber each setlist_song
    setlist.setlist_songs.each_with_index do |song, idx|
      song.position = idx + 1
      song.save
    end

    redirect_to setlist_path(setlist)
  end

  private
  def is_admin
    if !signed_in? || !current_user.admin?
      flash[:notice] = "You have to be an admin to do that."
      redirect_to root_path
    end
  end
end

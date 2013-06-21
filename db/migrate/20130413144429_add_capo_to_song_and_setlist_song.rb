class AddCapoToSongAndSetlistSong < ActiveRecord::Migration
  def change
    add_column :songs, :capo, :integer
    add_column :setlist_songs, :capo, :integer, :default => 0
  end
end

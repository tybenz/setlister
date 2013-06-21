class AddPositionToSetlistSong < ActiveRecord::Migration
  def change
    add_column :setlist_songs, :position, :integer, :default => 1
  end
end

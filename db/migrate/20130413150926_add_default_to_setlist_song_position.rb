class AddDefaultToSetlistSongPosition < ActiveRecord::Migration
  def change
    change_column :setlist_songs, :position, :integer, :default => 1
  end
end

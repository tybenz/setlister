class AddInfoToSongs < ActiveRecord::Migration
  def change
    add_column :songs, :info, :text
  end
end

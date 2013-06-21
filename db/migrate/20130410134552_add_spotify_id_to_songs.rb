class AddSpotifyIdToSongs < ActiveRecord::Migration
  def change
    add_column :songs, :spotify_uri, :string
  end
end

class Song < ActiveRecord::Base
  attr_accessible :title, :artist, :year, :text, :data_key, :spotify_uri, :capo

  has_many :setlist_songs
  has_many :setlists, :through => :setlist_songs

  def key
    data_key
  end

  def key=(new_key)
    write_attribute :data_key, new_key
  end
end

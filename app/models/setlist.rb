class Setlist < ActiveRecord::Base
  attr_accessible :title, :setlist_songs_attributes, :print, :print_without_capo

  has_many :setlist_songs
  has_many :songs, :through => :setlist_songs

  accepts_nested_attributes_for :setlist_songs
end

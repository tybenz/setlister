class SetlistSong < ActiveRecord::Base
  attr_accessible :song_id, :setlist_id, :data_key, :capo, :position

  belongs_to :setlist
  belongs_to :song

  default_scope order("position")

  def key
    data_key
  end

  def key=(new_key)
    write_attribtue(:key, new_key)
  end

  def title
    song.title
  end

  def artist
    song.artist
  end

  def year
    song.year
  end

  def license
    song.license
  end

  def text
    song.text
  end

  def info
    song.info
  end

  def slides
    song.slides
  end

  def spotify_uri
    song.spotify_uri
  end
end

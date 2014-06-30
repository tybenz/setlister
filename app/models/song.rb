class Song < ActiveRecord::Base
  attr_accessible :title, :artist, :year, :text, :data_key, :spotify_uri, :capo, :info, :year_string, :license

  has_many :setlist_songs
  has_many :setlists, :through => :setlist_songs

  def key
    data_key
  end

  def key=(new_key)
    write_attribute :data_key, new_key
  end

  def slides
      chord_regex = /\b([A-G][b\#]?(2|5|6|7|9|11|13|6\/9|7\-5|7\-9|7\#5|7\#9|7\+5|7\+9|7b5|7b9|7sus2|7sus4|add2|add4|add9|aug|dim|dim7|m\/maj7|m6|m7|m7b5|m9|m11|m13|maj7|maj9|maj11|maj13|mb5|m|sus|sus2|sus4)*)(?=[^A-z])/
      slides = text.gsub( chord_regex, '' ).gsub( /\//, '' ).gsub( /\([^\(\)]*\)/, '' ).gsub( /_/, '' ).gsub( /\r\n[\s]*\r\n/, "\n" ).split( /[A-Z\s0-9]+\:/ )
      slides.map do |s|
        s.strip
      end
  end

  def year_string
    year ? year.strftime("%Y") : ""
  end

  def year_string=(year_str)
    # Explicitly adding the rest of the date string so Time.parse works
    self.year = Time.parse("#{year_str}-01-01 00:00:00")
  rescue ArgumentError
    @year_invalid = true
  end

  def validate
    errors.add(:year, "is invalid") if @year_invalid
  end

end

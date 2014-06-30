class Group < ActiveRecord::Base
  has_many :setlists
  has_many :songs

  has_many :user_groups
  has_many :users, :through => :user_groups

  attr_accessible :name

  validates :name, :uniqueness => { :case_sensitive => false }

  def to_param
    name.downcase.squish.gsub( /\s/, '_' )
  end
end

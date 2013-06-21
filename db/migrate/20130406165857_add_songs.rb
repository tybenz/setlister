class AddSongs < ActiveRecord::Migration
  def change
    create_table :songs do |t|
      t.string :title
      t.string :artist
      t.string :license
      t.datetime :year
      t.text :text
      t.string :data_key

      t.timestamps
    end
  end
end

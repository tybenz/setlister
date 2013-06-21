class CreateSetlistSongs < ActiveRecord::Migration
  def change
    create_table :setlist_songs do |t|
      t.references :song
      t.references :setlist
      t.string :data_key

      t.timestamps
    end
  end
end

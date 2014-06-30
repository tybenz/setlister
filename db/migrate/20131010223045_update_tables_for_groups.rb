class UpdateTablesForGroups < ActiveRecord::Migration
  def change
    add_column :setlists, :group_id, :integer
    add_column :songs, :group_id, :integer
  end
end

class AddPrintAmountsToSetlist < ActiveRecord::Migration
  def change
    add_column :setlists, :print, :integer
    add_column :setlists, :print_without_capo, :integer
  end
end

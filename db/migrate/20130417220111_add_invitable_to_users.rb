class AddInvitableToUsers < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.string   :invitation_token, :limit => 60
      t.datetime :invitation_sent_at
      t.datetime :invitation_accepted_at
      t.integer  :invitation_limit
      t.integer  :invited_by_id
      t.string   :invited_by_type
    end

    # Allow null encrypted_password
    change_column :users, :encrypted_password, :string, :null => true
    add_index :users, :invitation_token, :unique => true
  end
end

task :keep_awake => :environment do
   uri = URI.parse("http://#{Setlister::Settings[:host]}/wake_up")
   Net::HTTP.get(uri)
end

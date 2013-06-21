require 'development_mail_interceptor'

ActionMailer::Base.smtp_settings = {
  :address              => Setlister::Settings[:smtp][:host],
  :port                 => Setlister::Settings[:smtp][:port],
  :domain               => Setlister::Settings[:smtp][:domain],
  :authentication       => "plain",
  :enable_starttls_auto => true,
  :user_name            => Setlister::Settings[:smtp][:username],
  :password             => Setlister::Settings[:smtp][:password]
}

ActionMailer::Base.delivery_method = :smtp
ActionMailer::Base.perform_deliveries = true
ActionMailer::Base.raise_delivery_errors = true
ActionMailer::Base.register_interceptor(DevelopmentMailInterceptor) if Rails.env.development?

ActionMailer::Base.default_url_options[:host] = Setlister::Settings[:host]

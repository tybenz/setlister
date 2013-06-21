class DevelopmentMailInterceptor
  def self.delivering_email(message)
    message.subject = "#{message.to} #{message.subject}"
    message.perform_deliveries = false
    Rails.logger.info("EMAIL DEV MODE: not sending email to: #{message.to}, with subject: #{message.subject}")
  end
end


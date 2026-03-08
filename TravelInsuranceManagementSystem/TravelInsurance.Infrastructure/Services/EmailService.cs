using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SendGrid;
using SendGrid.Helpers.Mail;
using TravelInsurance.Application.Interfaces.Services;

namespace TravelInsurance.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _apiKey;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _apiKey = config["SendGrid:ApiKey"] ?? throw new InvalidOperationException("SendGrid:ApiKey is not configured.");
            _fromEmail = config["SendGrid:FromEmail"] ?? throw new InvalidOperationException("SendGrid:FromEmail is not configured.");
            _fromName = config["SendGrid:FromName"] ?? "TravelSecure";
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            await Send(to, subject, plainText: body, html: null);
        }

        public async Task SendHtmlEmailAsync(string to, string subject, string htmlBody)
        {
            await Send(to, subject, plainText: null, html: htmlBody);
        }

        private async Task Send(string to, string subject, string? plainText, string? html)
        {
            _logger.LogInformation("Sending email to {To}, subject: {Subject}", to, subject);

            var client = new SendGridClient(_apiKey);
            var from = new EmailAddress(_fromEmail, _fromName);
            var toAddress = new EmailAddress(to);
            var msg = MailHelper.CreateSingleEmail(from, toAddress, subject, plainText, html);

            var response = await client.SendEmailAsync(msg);

            var responseBody = await response.Body.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(
                    "SendGrid failed. Status: {Status}, Body: {Body}",
                    (int)response.StatusCode, responseBody);

                throw new Exception(
                    $"Email delivery failed (HTTP {(int)response.StatusCode}): {responseBody}");
            }

            _logger.LogInformation("Email sent successfully to {To}. Status: {Status}", to, (int)response.StatusCode);
        }
    }
}

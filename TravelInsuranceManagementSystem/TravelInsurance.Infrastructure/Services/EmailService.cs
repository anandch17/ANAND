using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using TravelInsurance.Application.Interfaces.Services;

namespace TravelInsurance.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;

        public EmailService(ILogger<EmailService> logger)
        {
            _logger = logger;
        }

        public Task SendEmailAsync(string to, string subject, string body)
        {
            _logger.LogInformation("==========================================");
            _logger.LogInformation("EMAILING: {To}", to);
            _logger.LogInformation("SUBJECT: {Subject}", subject);
            _logger.LogInformation("BODY: {Body}", body);
            _logger.LogInformation("==========================================");
            return Task.CompletedTask;
        }

        public Task SendHtmlEmailAsync(string to, string subject, string htmlBody)
        {
            _logger.LogInformation("==========================================");
            _logger.LogInformation("EMAILING (HTML): {To}", to);
            _logger.LogInformation("SUBJECT: {Subject}", subject);
            _logger.LogInformation("HTML BODY: {HtmlBody}", htmlBody);
            _logger.LogInformation("==========================================");
            return Task.CompletedTask;
        }
    }
}

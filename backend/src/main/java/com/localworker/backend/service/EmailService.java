
package com.localworker.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String provider;
    private final String scriptUrl;
    private final String scriptSecret;
    private final HttpClient httpClient;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from:}") String fromEmail,
            @Value("${app.email.provider:smtp}") String provider,
            @Value("${GOOGLE_SCRIPT_URL:}") String scriptUrl,
            @Value("${GOOGLE_SCRIPT_SECRET:}") String scriptSecret) {

        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.provider = provider;
        this.scriptUrl = scriptUrl;
        this.scriptSecret = scriptSecret;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .build();
    }

    public void sendOtpEmail(String recipientEmail, String otp) {

        String subject = "LocalWorker - Email Verification";

        String message =
                "Hello,\n\n"
                        + "Welcome to LocalWorker!\n\n"
                        + "Your email verification OTP is: " + otp + "\n\n"
                        + "This OTP is valid for 5 minutes.\n\n"
                        + "Please do not share this OTP with anyone.\n\n"
                        + "If you did not request this verification, "
                        + "please ignore this email.\n\n"
                        + "Regards,\n"
                        + "LocalWorker Team";

        sendEmail(recipientEmail, subject, message);
    }

    public void sendPasswordResetOtpEmail(
            String recipientEmail,
            String otp) {

        String subject = "LocalWorker - Password Reset OTP";

        String message =
                "Hello,\n\n"
                        + "We received a request to reset your LocalWorker password.\n\n"
                        + "Your password reset OTP is: " + otp + "\n\n"
                        + "This OTP is valid for 5 minutes.\n\n"
                        + "You have a maximum of 5 verification attempts.\n\n"
                        + "If you did not request a password reset, "
                        + "please ignore this email. Your password will remain unchanged.\n\n"
                        + "Please do not share this OTP with anyone.\n\n"
                        + "Regards,\n"
                        + "LocalWorker Team";

        sendEmail(recipientEmail, subject, message);
    }

    private void sendEmail(
            String recipientEmail,
            String subject,
            String message) {

        if ("google-script".equalsIgnoreCase(provider)) {
            sendUsingGoogleScript(recipientEmail, subject, message);
        } else {
            sendUsingSmtp(recipientEmail, subject, message);
        }
    }

    private void sendUsingSmtp(
            String recipientEmail,
            String subject,
            String message) {

        try {
            SimpleMailMessage mail = new SimpleMailMessage();

            mail.setFrom(fromEmail);
            mail.setTo(recipientEmail);
            mail.setSubject(subject);
            mail.setText(message);

            mailSender.send(mail);

        } catch (org.springframework.mail.MailException exception) {
            throw new IllegalStateException(
                    "Gmail SMTP delivery failed.",
                    exception
            );
        }
    }

    private void sendUsingGoogleScript(
            String recipientEmail,
            String subject,
            String message) {

        if (scriptUrl.isBlank() || scriptSecret.isBlank()) {
            throw new IllegalStateException(
                    "Google Apps Script configuration is missing."
            );
        }

        try {
            String jsonBody = """
                    {
                      "secret": "%s",
                      "to": "%s",
                      "subject": "%s",
                      "message": "%s"
                    }
                    """.formatted(
                    escapeJson(scriptSecret),
                    escapeJson(recipientEmail),
                    escapeJson(subject),
                    escapeJson(message)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(scriptUrl))
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(
                            jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200
                    || response.statusCode() >= 300
                    || !response.body().contains("\"success\":true")) {

                throw new IllegalStateException(
                        "Google email delivery failed. HTTP status: "
                                + response.statusCode()
                                + ", response: " + response.body()
                );
            }

        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to contact Google email service.",
                    exception
            );

        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();

            throw new IllegalStateException(
                    "Google email request was interrupted.",
                    exception
            );
        }
    }

    private String escapeJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}

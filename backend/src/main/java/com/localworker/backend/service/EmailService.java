
package com.localworker.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private static final String RESEND_API_URL =
            "https://api.resend.com/emails";

    private final HttpClient httpClient;
    private final String apiKey;
    private final String fromEmail;

    public EmailService(
            @Value("${RESEND_API_KEY}") String apiKey,
            @Value("${app.mail.from:onboarding@resend.dev}") String fromEmail) {

        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.httpClient = HttpClient.newHttpClient();
    }

    // Registration OTP email
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

    // Password reset OTP email
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

    // Common email delivery method using Resend HTTPS API
    private void sendEmail(
            String recipientEmail,
            String subject,
            String message) {

        try {

            String jsonBody = """
                    {
                      "from": "%s",
                      "to": ["%s"],
                      "subject": "%s",
                      "text": "%s"
                    }
                    """.formatted(
                    escapeJson(fromEmail),
                    escapeJson(recipientEmail),
                    escapeJson(subject),
                    escapeJson(message)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(RESEND_API_URL))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(
                            jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200
                    || response.statusCode() >= 300) {

                throw new IllegalStateException(
                        "Resend email delivery failed. HTTP status: "
                                + response.statusCode()
                );
            }

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Unable to send email. Please try again later.",
                    exception
            );

        } catch (InterruptedException exception) {

            Thread.currentThread().interrupt();

            throw new IllegalStateException(
                    "Email sending was interrupted.",
                    exception
            );
        }
    }

    // Escape special characters before inserting text into JSON
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

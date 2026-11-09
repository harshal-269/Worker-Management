
package com.localworker.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from:${SPRING_MAIL_USERNAME}}")
            String fromEmail) {

        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
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

    // Common email delivery method using Gmail SMTP
    private void sendEmail(
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
                    "Unable to send email. Please try again later.",
                    exception
            );
        }
    }
}

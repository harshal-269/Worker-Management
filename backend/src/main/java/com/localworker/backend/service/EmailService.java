
package com.localworker.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username}") String fromEmail) {

        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    // Registration OTP email
    public void sendOtpEmail(String recipientEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(recipientEmail);
        message.setSubject("LocalWorker - Email Verification");

        message.setText(
                "Hello,\n\n"
                        + "Welcome to LocalWorker!\n\n"
                        + "Your email verification OTP is: " + otp + "\n\n"
                        + "This OTP is valid for 5 minutes.\n\n"
                        + "Please do not share this OTP with anyone.\n\n"
                        + "If you did not request this verification, "
                        + "please ignore this email.\n\n"
                        + "Regards,\n"
                        + "LocalWorker Team"
        );

        sendEmail(message);
    }

    // Password reset OTP email
    public void sendPasswordResetOtpEmail(
            String recipientEmail,
            String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(recipientEmail);
        message.setSubject("LocalWorker - Password Reset OTP");

        message.setText(
                "Hello,\n\n"
                        + "We received a request to reset your LocalWorker password.\n\n"
                        + "Your password reset OTP is: " + otp + "\n\n"
                        + "This OTP is valid for 5 minutes.\n\n"
                        + "You have a maximum of 5 verification attempts.\n\n"
                        + "If you did not request a password reset, "
                        + "please ignore this email. Your password will remain unchanged.\n\n"
                        + "Please do not share this OTP with anyone.\n\n"
                        + "Regards,\n"
                        + "LocalWorker Team"
        );

        sendEmail(message);
    }

    // Common email delivery method
    private void sendEmail(SimpleMailMessage message) {

        try {
            mailSender.send(message);

        } catch (MailException exception) {

            throw new IllegalStateException(
                    "Unable to send email. Please try again later.",
                    exception
            );
        }
    }
}

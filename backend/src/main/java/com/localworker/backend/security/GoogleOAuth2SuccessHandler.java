
package com.localworker.backend.security;

import com.localworker.backend.model.User;
import com.localworker.backend.service.GoogleAuthService;
import com.localworker.backend.service.OAuthLoginCodeService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger =
            LoggerFactory.getLogger(GoogleOAuth2SuccessHandler.class);

    private final GoogleAuthService googleAuthService;
    private final OAuthLoginCodeService codeService;
    private final String frontendUrl;

    public GoogleOAuth2SuccessHandler(
            GoogleAuthService googleAuthService,
            OAuthLoginCodeService codeService,
            @Value("${app.frontend-url}") String frontendUrl) {

        this.googleAuthService = googleAuthService;
        this.codeService = codeService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        try {
            logger.info("Google OAuth authentication succeeded.");

            Object principal = authentication.getPrincipal();

            if (!(principal instanceof OAuth2User oauth2User)) {
                throw new IllegalStateException(
                        "Authentication principal is not an OAuth2User"
                );
            }

            logger.info("Processing Google user.");

            User user = googleAuthService.processGoogleUser(oauth2User);

            if (user == null || user.getId() == null) {
                throw new IllegalStateException(
                        "Google authentication returned an invalid user."
                );
            }

            logger.info(
                    "Google user processed successfully. User ID: {}",
                    user.getId()
            );

            String code = codeService.createCode(user);

            if (code == null || code.isBlank()) {
                throw new IllegalStateException(
                        "Failed to generate OAuth login code."
                );
            }

            logger.info("One-time OAuth login code generated successfully.");

            String normalizedFrontendUrl = frontendUrl.replaceAll("/+$", "");

            String redirectUrl = normalizedFrontendUrl
                    + "/oauth2/callback?code="
                    + code;

            logger.info(
                    "Redirecting Google login to frontend callback: {}",
                    normalizedFrontendUrl + "/oauth2/callback?code=[REDACTED]"
            );

            response.sendRedirect(redirectUrl);

        } catch (Exception exception) {

            logger.error(
                    "Google OAuth success handler failed.",
                    exception
            );

            if (!response.isCommitted()) {
                response.sendRedirect(
                        frontendUrl.replaceAll("/+$", "")
                                + "/login?error=google_auth_failed"
                );
            }
        }
    }
}

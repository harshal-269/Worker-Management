package com.localworker.backend.service;

import com.localworker.backend.model.OAuthAccount;
import com.localworker.backend.model.Role;
import com.localworker.backend.model.User;
import com.localworker.backend.repository.OAuthAccountRepository;
import com.localworker.backend.repository.UserRepository;

import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;

@Service
public class GoogleAuthService {

    private static final String PROVIDER = "GOOGLE";

    private final UserRepository userRepository;
    private final OAuthAccountRepository oauthAccountRepository;

    public GoogleAuthService(
            UserRepository userRepository,
            OAuthAccountRepository oauthAccountRepository) {

        this.userRepository = userRepository;
        this.oauthAccountRepository = oauthAccountRepository;
    }

    @Transactional
    public GoogleUserResult processGoogleUser(OAuth2User oauth2User) {

        if (oauth2User == null) {
            throw oauthError("Google user information is missing");
        }

        Map<String, Object> attributes = oauth2User.getAttributes();

        String googleId = getStringAttribute(attributes, "sub");
        String email = getStringAttribute(attributes, "email");
        String name = getStringAttribute(attributes, "name");

        Object emailVerified = attributes.get("email_verified");

        if (googleId == null || googleId.isBlank()) {
            throw oauthError("Google account ID is missing");
        }

        if (email == null || email.isBlank()) {
            throw oauthError("Google account email is missing");
        }

        if (!Boolean.TRUE.equals(emailVerified)) {
            throw oauthError("Google email is not verified");
        }

        email = email.trim().toLowerCase(Locale.ROOT);

        String finalName = name != null && !name.isBlank()
                ? name.trim()
                : email.substring(0, email.indexOf("@"));

        // 1. Check whether this Google identity is already linked.
        var existingOAuthAccount =
                oauthAccountRepository.findByProviderAndProviderUserId(
                        PROVIDER, googleId);

        if (existingOAuthAccount.isPresent()) {

            User user = existingOAuthAccount.get().getUser();

            if (user.getRole() == null) {
                throw oauthError("Existing account has no assigned role");
            }

            return new GoogleUserResult(
                    true,
                    googleId,
                    user.getEmail(),
                    user.getName(),
                    user.getRole()
            );
        }

        // 2. Check whether a LocalWorker account already uses this email.
        var existingUser = userRepository.findByEmailIgnoreCase(email);

        if (existingUser.isPresent()) {

            User user = existingUser.get();

            if (user.getRole() == null) {
                throw oauthError("Existing account has no assigned role");
            }

            // Link Google to the existing account without changing its role.
            OAuthAccount account =
                    new OAuthAccount(PROVIDER, googleId, user);

            oauthAccountRepository.save(account);

            return new GoogleUserResult(
                    true,
                    googleId,
                    user.getEmail(),
                    user.getName(),
                    user.getRole()
            );
        }

        // 3. New Google user: do not create a database account yet.
        // The user must first select CUSTOMER or WORKER.
        return new GoogleUserResult(
                false,
                googleId,
                email,
                finalName,
                null
        );
    }

    private String getStringAttribute(
            Map<String, Object> attributes,
            String key) {

        Object value = attributes.get(key);

        return value instanceof String stringValue
                ? stringValue
                : null;
    }

    private OAuth2AuthenticationException oauthError(String message) {

        return new OAuth2AuthenticationException(
                new OAuth2Error("google_authentication_error"),
                message
        );
    }

    public record GoogleUserResult(
            boolean existingUser,
            String googleId,
            String email,
            String name,
            Role role
    ) {
    }
}
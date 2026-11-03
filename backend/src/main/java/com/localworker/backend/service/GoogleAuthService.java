
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

import java.util.List;
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
    public User processGoogleUser(OAuth2User oauth2User) {

        Map<String, Object> attributes = oauth2User.getAttributes();

        String googleId = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        Boolean emailVerified =
                (Boolean) attributes.get("email_verified");

        if (googleId == null || googleId.isBlank()) {
            throw oauthError("Google account ID is missing");
        }

        if (email == null || email.isBlank()) {
            throw oauthError("Google account email is missing");
        }

        if (!Boolean.TRUE.equals(emailVerified)) {
            throw oauthError("Google email is not verified");
        }

        // 1. Check whether this Google account is already linked.
        return oauthAccountRepository
                .findByProviderAndProviderUserId(PROVIDER, googleId)
                .map(OAuthAccount::getUser)
                .orElseGet(() -> createOrLinkGoogleAccount(
                        googleId, email, name
                ));
    }

    private User createOrLinkGoogleAccount(
            String googleId,
            String email,
            String name) {

        // 2. Check existing LocalWorker accounts with this email.
        List<User> existingUsers =
                userRepository.findAllByEmail(email);

        if (existingUsers.size() > 1) {
            throw oauthError(
                    "Multiple accounts use this email. Contact support."
            );
        }

        User user;

        if (existingUsers.size() == 1) {

            // Link the verified Google identity to the existing account.
            user = existingUsers.get(0);

        } else {

            // 3. Register a new Google user.
            user = new User();

            user.setName(
                    name != null && !name.isBlank()
                            ? name
                            : email.split("@")[0]
            );

            user.setEmail(email);
            user.setPhone(null);
            user.setPassword(null);
            user.setRole(Role.CUSTOMER);

            user = userRepository.save(user);
        }

        // 4. Save the Google identity mapping.
        OAuthAccount account =
                new OAuthAccount(PROVIDER, googleId, user);

        oauthAccountRepository.save(account);

        return user;
    }

    private OAuth2AuthenticationException oauthError(String message) {

        return new OAuth2AuthenticationException(
                new OAuth2Error("google_authentication_error"),
                message
        );
    }
}

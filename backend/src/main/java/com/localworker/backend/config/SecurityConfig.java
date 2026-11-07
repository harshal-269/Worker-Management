
package com.localworker.backend.config;

import com.localworker.backend.security.GoogleOAuth2SuccessHandler;
import com.localworker.backend.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.googleOAuth2SuccessHandler = googleOAuth2SuccessHandler;
    }

    // Google OAuth2 authentication
    @Bean
    @Order(1)
    public SecurityFilterChain oauthSecurityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .securityMatcher("/oauth2/**", "/login/oauth2/**")
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.IF_REQUIRED
                        )
                )
                .authorizeHttpRequests(auth ->
                        auth.anyRequest().permitAll()
                )
                .oauth2Login(oauth ->
                        oauth.successHandler(googleOAuth2SuccessHandler)
                );

        return http.build();
    }

    // JWT-protected REST APIs
    @Bean
    @Order(2)
    public SecurityFilterChain apiSecurityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )
                .authorizeHttpRequests(auth -> auth

                        // CORS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        // Authentication
                        .requestMatchers("/api/auth/**")
                        .permitAll()

                        // Images
                        .requestMatchers(HttpMethod.GET, "/api/images/**")
                        .permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/images/upload/**")
                        .authenticated()

                        // Customer profile
                        .requestMatchers(HttpMethod.GET, "/api/users/me")
                        .hasAnyAuthority(
                                "ROLE_CUSTOMER",
                                "ROLE_WORKER",
                                "ROLE_ADMIN"
                        )

                        .requestMatchers(HttpMethod.PUT, "/api/users/me")
                        .hasAuthority("ROLE_CUSTOMER")

                        // Other user-management APIs are ADMIN-only
                        .requestMatchers("/api/users/**")
                        .hasAuthority("ROLE_ADMIN")

                        // Services
                        .requestMatchers(HttpMethod.GET, "/api/services/**")
                        .hasAnyAuthority(
                                "ROLE_CUSTOMER",
                                "ROLE_WORKER",
                                "ROLE_ADMIN"
                        )

                        .requestMatchers("/api/services/**")
                        .hasAuthority("ROLE_ADMIN")

                        // WORKER SELF-SERVICE APIs
                        // Only workers and admins can access their worker dashboard APIs.
                        .requestMatchers("/api/workers/me/**")
                        .hasAnyAuthority("ROLE_WORKER", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/workers/me")
                        .hasAnyAuthority("ROLE_WORKER", "ROLE_ADMIN")

                        // ADMIN-ONLY worker management operations
                        .requestMatchers(HttpMethod.PUT, "/api/workers/*/services")
                        .hasAuthority("ROLE_ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/workers/*")
                        .hasAuthority("ROLE_ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/workers/*")
                        .hasAuthority("ROLE_ADMIN")

                        // Worker profile creation - preserve existing permissions.
                        .requestMatchers(HttpMethod.POST, "/api/workers")
                        .hasAnyAuthority("ROLE_WORKER", "ROLE_ADMIN")

                        // Customers can browse and search worker profiles.
                        .requestMatchers(HttpMethod.GET, "/api/workers/**")
                        .hasAnyAuthority(
                                "ROLE_CUSTOMER",
                                "ROLE_WORKER",
                                "ROLE_ADMIN"
                        )

                        // Remaining worker-management operations
                        .requestMatchers("/api/workers/**")
                        .hasAnyAuthority("ROLE_WORKER", "ROLE_ADMIN")

                        // Booking APIs
                        .requestMatchers("/api/bookings/**")
                        .hasAnyAuthority(
                                "ROLE_CUSTOMER",
                                "ROLE_WORKER",
                                "ROLE_ADMIN"
                        )

                        // Notification APIs
                        .requestMatchers("/api/notifications/**")
                        .hasAnyAuthority(
                                "ROLE_CUSTOMER",
                                "ROLE_WORKER",
                                "ROLE_ADMIN"
                        )

                        // All remaining endpoints require authentication
                        .anyRequest()
                        .authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // CORS configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:5174"
        ));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept"
        ));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}

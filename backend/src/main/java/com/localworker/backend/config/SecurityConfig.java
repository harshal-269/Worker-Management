
package com.localworker.backend.config;

import com.localworker.backend.security.GoogleOAuth2SuccessHandler;
import com.localworker.backend.security.JwtAuthenticationFilter;

import org.springframework.beans.factory.annotation.Value;
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

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler;
    private final String frontendUrl;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler,
            @Value("${app.frontend-url:http://localhost:5174}") String frontendUrl) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.googleOAuth2SuccessHandler = googleOAuth2SuccessHandler;
        this.frontendUrl = frontendUrl;
    }

    // Google OAuth2 authentication
    @Bean
    @Order(1)
    public SecurityFilterChain oauthSecurityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .securityMatcher("/oauth2/**", "/login/oauth2/**")
                .cors(cors -> {})
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
                        .hasAnyAuthority("ROLE_CUSTOMER", "ROLE_WORKER", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/users/me")
                        .hasAuthority("ROLE_CUSTOMER")

                        .requestMatchers("/api/users/**")
                        .hasAuthority("ROLE_ADMIN")

                        // Services
                        .requestMatchers(HttpMethod.GET, "/api/services/**")
                        .hasAnyAuthority("ROLE_CUSTOMER", "ROLE_WORKER", "ROLE_ADMIN")

                        .requestMatchers("/api/services/**")
                        .hasAuthority("ROLE_ADMIN")

                        // Worker self-service
                        .requestMatchers("/api/workers/me/**")
                        .hasAnyAuthority("ROLE_WORKER", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/workers/me")
                        .hasAnyAuthority("ROLE_WORKER", "ROLE_ADMIN")

                        // Admin-only worker management
                        .requestMatchers(HttpMethod.PUT, "/api/workers/*/services")
                        .hasAuthority("ROLE_ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/workers/*")
                        .hasAuthority("ROLE_ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/workers/*")
                        .hasAuthority("ROLE_ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/workers")
                        .hasAnyAuthority("ROLE_WORKER", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/workers/**")
                        .hasAnyAuthority("ROLE_CUSTOMER", "ROLE_WORKER", "ROLE_ADMIN")

                        .requestMatchers("/api/workers/**")
                        .hasAnyAuthority("ROLE_WORKER", "ROLE_ADMIN")

                        // Booking APIs
                        .requestMatchers("/api/bookings/**")
                        .hasAnyAuthority("ROLE_CUSTOMER", "ROLE_WORKER", "ROLE_ADMIN")

                        // Notification APIs
                        .requestMatchers("/api/notifications/**")
                        .hasAnyAuthority("ROLE_CUSTOMER", "ROLE_WORKER", "ROLE_ADMIN")

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

        List<String> allowedOrigins = new ArrayList<>();

        allowedOrigins.add("http://localhost:5173");
        allowedOrigins.add("http://localhost:5174");
        allowedOrigins.add("https://workermanagement.vercel.app");

        if (frontendUrl != null && !frontendUrl.isBlank()) {
            allowedOrigins.add(frontendUrl.replaceAll("/+$", ""));
        }

        configuration.setAllowedOrigins(allowedOrigins);

        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH",
                "DELETE", "OPTIONS"
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

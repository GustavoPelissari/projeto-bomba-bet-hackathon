package com.example.bombaBet.config;

import com.example.bombaBet.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /*
     * CADEIA 1 — API REST (/api/**), consumida pelo app React.
     * Sem sessão (stateless) e autenticação via token JWT no header Authorization.
     */
    @Bean
    @Order(1)
    public SecurityFilterChain apiFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception {

        return http
                // Esta cadeia só vale para as rotas que começam com /api/
                .securityMatcher("/api/**")

                .csrf(AbstractHttpConfigurer::disable)

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth
                        // Login e cadastro: liberados
                        .requestMatchers("/api/auth/**").permitAll()

                        // Consultas públicas de seleções e partidas (GET)
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/selecoes/**",
                                "/api/partidas/**"
                        ).permitAll()

                        // Palpites exigem usuário autenticado (token JWT)
                        .requestMatchers("/api/palpites/**").authenticated()

                        // Demais rotas da API (ex.: /api/usuarios/me, /ranking) liberadas;
                        // o filtro JWT ainda popula o usuário quando há token.
                        .anyRequest().permitAll()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .build();
    }

    /*
     * CADEIA 2 — Painel web (Thymeleaf).
     * Usa sessão + formulário de login. Quem não estiver logado como ADMIN
     * e tentar abrir /admin/** é redirecionado automaticamente para /login.
     */
    @Bean
    @Order(2)
    public SecurityFilterChain webFilterChain(
            HttpSecurity http
    ) throws Exception {

        return http
                // CSRF desativado para simplificar os formulários do painel.
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        // Página de login e recursos estáticos: liberados
                        .requestMatchers(
                                "/login",
                                "/error",
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/webjars/**"
                        ).permitAll()

                        // Painel administrativo: SÓ ADMIN logado
                        .requestMatchers("/admin", "/admin/**").hasRole("ADMIN")

                        // Demais rotas web liberadas
                        .anyRequest().permitAll()
                )

                // Formulário de login (campos email/password do template auth/login.html)
                .formLogin(form -> form
                        .loginPage("/login")                 // tela de login
                        .loginProcessingUrl("/login")        // POST que o Spring processa
                        .usernameParameter("email")          // nosso campo é "email"
                        .passwordParameter("password")
                        .defaultSuccessUrl("/admin", true)   // sucesso -> dashboard
                        .failureUrl("/login?erro=true")      // falha -> mostra erro
                        .permitAll()
                )

                // Logout (botão "Sair" do navbar faz POST /logout)
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login?logout")
                        .permitAll()
                )

                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

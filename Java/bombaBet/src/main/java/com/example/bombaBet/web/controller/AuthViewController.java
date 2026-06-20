package com.example.bombaBet.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuthViewController {

    // Apenas exibe a página de login.
    // O POST /login é processado pelo Spring Security (ver SecurityConfig:
    // formLogin -> loginProcessingUrl("/login")).
    @GetMapping("/login")
    public String login() {
        return "auth/login";
    }
}

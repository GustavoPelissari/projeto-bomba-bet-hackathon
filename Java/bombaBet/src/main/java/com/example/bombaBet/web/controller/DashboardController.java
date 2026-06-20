package com.example.bombaBet.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping("/admin")
    public String dashboard() {
        return "admin/dashboard";
    }
}
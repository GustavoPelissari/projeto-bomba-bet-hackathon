package com.example.bombaBet.web.controller;

import com.example.bombaBet.service.SelecaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/selecoes")
public class SelecaoViewController {

    private final SelecaoService selecaoService;

    @GetMapping
    public String listar(Model model) {

        model.addAttribute(
                "selecoes",
                selecaoService.listarTodas()
        );

        return "admin/selecoes/lista";
    }

    @GetMapping("/novo")
    public String formulario() {
        return "admin/selecoes/form";
    }
}
package com.example.bombaBet.web.controller;

import com.example.bombaBet.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/usuarios")
public class UsuarioViewController {

    private final UsuarioService usuarioService;

    @GetMapping
    public String listar(Model model) {

        model.addAttribute(
                "usuarios",
                usuarioService.listarTodos()
        );

        return "admin/usuarios/lista";
    }
}
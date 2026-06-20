package com.example.bombaBet.web.controller;

import com.example.bombaBet.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/usuarios")
public class UsuarioViewController {

    private final UsuarioService usuarioService;

    // Lista (ou busca por nome/e-mail) os usuários.
    @GetMapping
    public String listar(
            @RequestParam(required = false) String termo,
            Model model
    ) {
        model.addAttribute("usuarios", usuarioService.pesquisar(termo));
        model.addAttribute("termo", termo); // mantém o texto digitado na busca
        return "admin/usuarios/lista";
    }

    // Bloqueia um usuário.
    @PostMapping("/{id}/bloquear")
    public String bloquear(@PathVariable Long id) {
        usuarioService.bloquear(id);
        return "redirect:/admin/usuarios";
    }

    // Desbloqueia um usuário.
    @PostMapping("/{id}/desbloquear")
    public String desbloquear(@PathVariable Long id) {
        usuarioService.desbloquear(id);
        return "redirect:/admin/usuarios";
    }
}

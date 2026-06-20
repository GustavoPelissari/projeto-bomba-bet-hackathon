package com.example.bombaBet.web.controller;

import com.example.bombaBet.service.PartidaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/partidas")
public class PartidaViewController {

    private final PartidaService partidaService;

    @GetMapping
    public String listar(Model model) {

        model.addAttribute(
                "partidas",
                partidaService.listarTodas()
        );

        return "admin/partidas/lista";
    }

    @GetMapping("/nova")
    public String formulario() {
        return "admin/partidas/form";
    }

    @GetMapping("/{id}/resultado")
    public String resultado(
            @PathVariable Long id,
            Model model
    ) {

        model.addAttribute(
                "partida",
                partidaService.buscarPorId(id)
        );

        return "admin/partidas/resultado";
    }
}
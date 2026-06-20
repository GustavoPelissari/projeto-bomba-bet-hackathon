package com.example.bombaBet.web.controller;

import com.example.bombaBet.model.Selecao;
import com.example.bombaBet.service.SelecaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/nova")
    public String formulario(Model model) {

        model.addAttribute(
                "selecao",
                new Selecao()
        );

        return "admin/selecoes/form";
    }

    @PostMapping
    public String salvar(
            @ModelAttribute Selecao selecao
    ) {

        selecaoService.cadastrar(selecao);

        return "redirect:/admin/selecoes";
    }
}
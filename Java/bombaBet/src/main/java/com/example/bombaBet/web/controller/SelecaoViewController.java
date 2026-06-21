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
    public String listar(
            @RequestParam(required = false) String nome,
            Model model
    ) {
        // Se houver termo de busca, filtra por nome; senão, lista todas.
        if (nome != null && !nome.isBlank()) {
            model.addAttribute("selecoes", selecaoService.pesquisarPorNome(nome));
        } else {
            model.addAttribute("selecoes", selecaoService.listarTodas());
        }
        model.addAttribute("nome", nome); // mantém o texto digitado no campo

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

    @GetMapping("/{id}/editar")
    public String editar(
            @PathVariable Long id,
            Model model
    ) {

        model.addAttribute(
                "selecao",
                selecaoService.buscarPorId(id)
        );

        return "admin/selecoes/form";
    }

    @PostMapping("/{id}/editar")
    public String atualizar(
            @PathVariable Long id,
            @ModelAttribute Selecao selecao,
            Model model
    ) {
        try {
            selecaoService.atualizar(id, selecao);
            return "redirect:/admin/selecoes";
        } catch (RuntimeException e) {
            // Volta ao formulário (em modo edição) mostrando a mensagem.
            selecao.setId(id);
            model.addAttribute("erro", e.getMessage());
            return "admin/selecoes/form";
        }
    }

    @PostMapping("/{id}/excluir")
    public String excluir(
            @PathVariable Long id
    ) {
        try {
            selecaoService.excluir(id);
        } catch (RuntimeException e) {
            // Não foi possível excluir (ex.: vinculada a partidas) — só volta à lista.
        }
        return "redirect:/admin/selecoes";
    }

    @PostMapping
    public String salvar(
            @ModelAttribute Selecao selecao,
            Model model
    ) {
        try {
            selecaoService.cadastrar(selecao);
            return "redirect:/admin/selecoes";
        } catch (RuntimeException e) {
            // Volta ao formulário mostrando a mensagem (ex.: grupo inválido).
            model.addAttribute("erro", e.getMessage());
            return "admin/selecoes/form";
        }
    }
}
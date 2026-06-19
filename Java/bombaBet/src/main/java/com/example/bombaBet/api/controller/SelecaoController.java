package com.example.bombaBet.api.controller;

import com.example.bombaBet.model.Selecao;
import com.example.bombaBet.service.SelecaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/selecoes")
@RequiredArgsConstructor
public class SelecaoController {

    private final SelecaoService selecaoService;

    @GetMapping
    public List<Selecao> listarTodas() {
        return selecaoService.listarTodas();
    }

    @GetMapping("/{id}")
    public Selecao buscarPorId(
            @PathVariable Long id
    ) {
        return selecaoService.buscarPorId(id);
    }

    @PostMapping
    public Selecao cadastrar(
            @RequestBody Selecao selecao
    ) {
        return selecaoService.cadastrar(selecao);
    }

    @PutMapping("/{id}")
    public Selecao atualizar(
            @PathVariable Long id,
            @RequestBody Selecao selecao
    ) {
        return selecaoService.atualizar(id, selecao);
    }

    @DeleteMapping("/{id}")
    public void excluir(
            @PathVariable Long id
    ) {
        selecaoService.excluir(id);
    }
}
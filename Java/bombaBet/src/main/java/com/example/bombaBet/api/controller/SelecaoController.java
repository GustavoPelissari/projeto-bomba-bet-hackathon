package com.example.bombaBet.api.controller;

import com.example.bombaBet.api.dto.selecao.SelecaoResponseDto;
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
    public List<SelecaoResponseDto> listarTodas() {
        return selecaoService.listarTodas()
                .stream()
                .map(SelecaoResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public SelecaoResponseDto buscarPorId(
            @PathVariable Long id
    ) {
        return SelecaoResponseDto.fromEntity(
                selecaoService.buscarPorId(id)
        );
    }

    @PostMapping
    public SelecaoResponseDto cadastrar(
            @RequestBody Selecao selecao
    ) {
        return SelecaoResponseDto.fromEntity(
                selecaoService.cadastrar(selecao)
        );
    }

    @PutMapping("/{id}")
    public SelecaoResponseDto atualizar(
            @PathVariable Long id,
            @RequestBody Selecao selecao
    ) {
        return SelecaoResponseDto.fromEntity(
                selecaoService.atualizar(id, selecao)
        );
    }

    @DeleteMapping("/{id}")
    public void excluir(
            @PathVariable Long id
    ) {
        selecaoService.excluir(id);
    }
}
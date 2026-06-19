package com.example.bombaBet.api;

import com.example.bombaBet.api.dto.selecao.SelecaoRequestDto;
import com.example.bombaBet.api.dto.selecao.SelecaoResponseDto;
import com.example.bombaBet.model.Selecao;
import com.example.bombaBet.service.SelecaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/selecoes")
@RequiredArgsConstructor
public class SelecaoApi {

    private final SelecaoService selecaoService;

    @GetMapping
    public ResponseEntity<List<SelecaoResponseDto>> listar(
            @RequestParam(required = false) String nome
    ) {
        List<Selecao> selecoes;

        if (nome != null && !nome.isBlank()) {
            selecoes = selecaoService.pesquisarPorNome(nome);
        } else {
            selecoes = selecaoService.listarTodas();
        }

        List<SelecaoResponseDto> response = selecoes
                .stream()
                .map(this::converterParaResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SelecaoResponseDto> buscarPorId(
            @PathVariable Long id
    ) {
        Selecao selecao = selecaoService.buscarPorId(id);

        return ResponseEntity.ok(
                converterParaResponse(selecao)
        );
    }

    @GetMapping("/codigo/{codigoFifa}")
    public ResponseEntity<SelecaoResponseDto> buscarPorCodigoFifa(
            @PathVariable String codigoFifa
    ) {
        Selecao selecao = selecaoService.buscarPorCodigoFifa(codigoFifa);

        return ResponseEntity.ok(
                converterParaResponse(selecao)
        );
    }

    @PostMapping
    public ResponseEntity<SelecaoResponseDto> cadastrar(
            @Valid @RequestBody SelecaoRequestDto request
    ) {
        Selecao selecao = selecaoService.cadastrar(
                converterParaEntidade(request)
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(converterParaResponse(selecao));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SelecaoResponseDto> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody SelecaoRequestDto request
    ) {
        Selecao selecao = selecaoService.atualizar(
                id,
                converterParaEntidade(request)
        );

        return ResponseEntity.ok(
                converterParaResponse(selecao)
        );
    }

    @PatchMapping("/{id}/bandeira")
    public ResponseEntity<SelecaoResponseDto> atualizarBandeira(
            @PathVariable Long id,
            @RequestParam String bandeira
    ) {
        Selecao selecao = selecaoService.atualizarBandeira(
                id,
                bandeira
        );

        return ResponseEntity.ok(
                converterParaResponse(selecao)
        );
    }

    @DeleteMapping("/{id}/bandeira")
    public ResponseEntity<SelecaoResponseDto> removerBandeira(
            @PathVariable Long id
    ) {
        Selecao selecao = selecaoService.removerBandeira(id);

        return ResponseEntity.ok(
                converterParaResponse(selecao)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id
    ) {
        selecaoService.excluir(id);

        return ResponseEntity.noContent().build();
    }

    private Selecao converterParaEntidade(
            SelecaoRequestDto request
    ) {
        return Selecao.builder()
                .nome(request.getNome())
                .codigoFifa(request.getCodigoFifa())
                .grupo(request.getGrupo())
                .bandeira(request.getBandeira())
                .build();
    }

    private SelecaoResponseDto converterParaResponse(
            Selecao selecao
    ) {
        return SelecaoResponseDto.builder()
                .id(selecao.getId())
                .nome(selecao.getNome())
                .codigoFifa(selecao.getCodigoFifa())
                .grupo(selecao.getGrupo())
                .bandeira(selecao.getBandeira())
                .build();
    }
}
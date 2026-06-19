package com.example.bombaBet.api;

import com.example.bombaBet.api.dto.palpite.PalpiteRequestDto;
import com.example.bombaBet.api.dto.palpite.PalpiteResponseDto;
import com.example.bombaBet.model.Palpite;
import com.example.bombaBet.service.PalpiteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/palpites")
@RequiredArgsConstructor
public class PalpiteApi {

    private final PalpiteService palpiteService;

    @GetMapping
    public ResponseEntity<List<PalpiteResponseDto>> listarTodos() {
        List<PalpiteResponseDto> palpites = palpiteService
                .listarTodos()
                .stream()
                .map(this::converterParaResponse)
                .toList();

        return ResponseEntity.ok(palpites);
    }

    @GetMapping("/meus")
    public ResponseEntity<List<PalpiteResponseDto>> listarMeusPalpites(
            Authentication authentication
    ) {
        String emailUsuarioLogado = authentication.getName();

        List<PalpiteResponseDto> palpites = palpiteService
                .listarPorEmailUsuario(emailUsuarioLogado)
                .stream()
                .map(this::converterParaResponse)
                .toList();

        return ResponseEntity.ok(palpites);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PalpiteResponseDto> buscarPorId(
            @PathVariable Long id
    ) {
        Palpite palpite = palpiteService.buscarPorId(id);

        return ResponseEntity.ok(
                converterParaResponse(palpite)
        );
    }

    @PostMapping
    public ResponseEntity<PalpiteResponseDto> registrar(
            @Valid @RequestBody PalpiteRequestDto request,
            Authentication authentication
    ) {
        String emailUsuarioLogado = authentication.getName();

        Palpite palpite = palpiteService.registrarPorEmail(
                emailUsuarioLogado,
                request.getPartidaId(),
                request.getGolsCasa(),
                request.getGolsVisitante()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(converterParaResponse(palpite));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PalpiteResponseDto> editar(
            @PathVariable Long id,
            @Valid @RequestBody PalpiteRequestDto request,
            Authentication authentication
    ) {
        String emailUsuarioLogado = authentication.getName();

        Palpite palpite = palpiteService.editarPorEmail(
                id,
                emailUsuarioLogado,
                request.getGolsCasa(),
                request.getGolsVisitante()
        );

        return ResponseEntity.ok(
                converterParaResponse(palpite)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String emailUsuarioLogado = authentication.getName();

        palpiteService.excluirPorEmail(
                id,
                emailUsuarioLogado
        );

        return ResponseEntity.noContent().build();
    }

    private PalpiteResponseDto converterParaResponse(Palpite palpite) {
        return PalpiteResponseDto.builder()
                .id(palpite.getId())
                .partidaId(
                        palpite.getPartida() != null
                                ? palpite.getPartida().getId()
                                : null
                )
                .usuario(
                        palpite.getUsuario() != null
                                ? palpite.getUsuario().getNome()
                                : null
                )
                .golsCasa(palpite.getGolsCasa())
                .golsVisitante(palpite.getGolsVisitante())
                .pontuacao(palpite.getPontuacao())
                .criterioPontuacao(palpite.getCriterioPontuacao())
                .build();
    }
}
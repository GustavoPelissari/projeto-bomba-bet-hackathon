package com.example.bombaBet.api.controller;

import com.example.bombaBet.api.dto.palpite.PalpiteResponseDto;
import com.example.bombaBet.model.Palpite;
import com.example.bombaBet.service.PalpiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/palpites")
@RequiredArgsConstructor
public class PalpiteController {

    private final PalpiteService palpiteService;

    @GetMapping
    public List<PalpiteResponseDto> listarTodos() {
        return palpiteService.listarTodos()
                .stream()
                .map(PalpiteResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public PalpiteResponseDto buscarPorId(
            @PathVariable Long id
    ) {
        return PalpiteResponseDto.fromEntity(
                palpiteService.buscarPorId(id)
        );
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<PalpiteResponseDto> listarPorUsuario(
            @PathVariable Long usuarioId
    ) {
        return palpiteService.listarPorUsuario(usuarioId)
                .stream()
                .map(PalpiteResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/email")
    public List<PalpiteResponseDto> listarPorEmail(
            @RequestParam String email
    ) {
        return palpiteService.listarPorEmailUsuario(email)
                .stream()
                .map(PalpiteResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/partida/{partidaId}")
    public List<PalpiteResponseDto> listarPorPartida(
            @PathVariable Long partidaId
    ) {
        return palpiteService.listarPorPartida(partidaId)
                .stream()
                .map(PalpiteResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/usuario/{usuarioId}/partida/{partidaId}")
    public PalpiteResponseDto buscarPorUsuarioEPartida(
            @PathVariable Long usuarioId,
            @PathVariable Long partidaId
    ) {
        return PalpiteResponseDto.fromEntity(
                palpiteService.buscarPorUsuarioEPartida(
                        usuarioId,
                        partidaId
                )
        );
    }

    @PostMapping
    public PalpiteResponseDto registrar(
            @RequestParam Long usuarioId,
            @RequestParam Long partidaId,
            @RequestParam Integer golsCasa,
            @RequestParam Integer golsVisitante
    ) {
        return PalpiteResponseDto.fromEntity(
                palpiteService.registrar(
                        usuarioId,
                        partidaId,
                        golsCasa,
                        golsVisitante
                )
        );
    }

    @PutMapping("/{palpiteId}")
    public PalpiteResponseDto editar(
            @PathVariable Long palpiteId,
            @RequestParam Long usuarioId,
            @RequestParam Integer golsCasa,
            @RequestParam Integer golsVisitante
    ) {
        return PalpiteResponseDto.fromEntity(
                palpiteService.editar(
                        palpiteId,
                        usuarioId,
                        golsCasa,
                        golsVisitante
                )
        );
    }

    @DeleteMapping("/{palpiteId}")
    public void excluir(
            @PathVariable Long palpiteId,
            @RequestParam Long usuarioId
    ) {
        palpiteService.excluir(
                palpiteId,
                usuarioId
        );
    }

    @GetMapping("/contagem")
    public long contarTodos() {
        return palpiteService.contarTodos();
    }

    @GetMapping("/contagem/usuario/{usuarioId}")
    public long contarPorUsuario(
            @PathVariable Long usuarioId
    ) {
        return palpiteService.contarPorUsuario(usuarioId);
    }
}
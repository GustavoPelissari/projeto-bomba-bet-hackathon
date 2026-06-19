package com.example.bombaBet.api.controller;

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
    public List<Palpite> listarTodos() {
        return palpiteService.listarTodos();
    }

    @GetMapping("/{id}")
    public Palpite buscarPorId(
            @PathVariable Long id
    ) {
        return palpiteService.buscarPorId(id);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Palpite> listarPorUsuario(
            @PathVariable Long usuarioId
    ) {
        return palpiteService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/email")
    public List<Palpite> listarPorEmail(
            @RequestParam String email
    ) {
        return palpiteService.listarPorEmailUsuario(email);
    }

    @GetMapping("/partida/{partidaId}")
    public List<Palpite> listarPorPartida(
            @PathVariable Long partidaId
    ) {
        return palpiteService.listarPorPartida(partidaId);
    }

    @GetMapping("/usuario/{usuarioId}/partida/{partidaId}")
    public Palpite buscarPorUsuarioEPartida(
            @PathVariable Long usuarioId,
            @PathVariable Long partidaId
    ) {
        return palpiteService.buscarPorUsuarioEPartida(
                usuarioId,
                partidaId
        );
    }

    @PostMapping
    public Palpite registrar(
            @RequestParam Long usuarioId,
            @RequestParam Long partidaId,
            @RequestParam Integer golsCasa,
            @RequestParam Integer golsVisitante
    ) {
        return palpiteService.registrar(
                usuarioId,
                partidaId,
                golsCasa,
                golsVisitante
        );
    }

    @PutMapping("/{palpiteId}")
    public Palpite editar(
            @PathVariable Long palpiteId,
            @RequestParam Long usuarioId,
            @RequestParam Integer golsCasa,
            @RequestParam Integer golsVisitante
    ) {
        return palpiteService.editar(
                palpiteId,
                usuarioId,
                golsCasa,
                golsVisitante
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

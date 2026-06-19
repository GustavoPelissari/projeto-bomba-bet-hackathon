package com.example.bombaBet.api.controller;

import com.example.bombaBet.model.Partida;
import com.example.bombaBet.service.PartidaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/partidas")
@RequiredArgsConstructor
public class PartidaController {

    private final PartidaService partidaService;

    @GetMapping
    public List<Partida> listarTodas() {
        return partidaService.listarTodas();
    }

    @GetMapping("/{id}")
    public Partida buscarPorId(
            @PathVariable Long id
    ) {
        return partidaService.buscarPorId(id);
    }

    @GetMapping("/proximas")
    public List<Partida> listarProximasPartidas() {
        return partidaService.listarProximasPartidas();
    }

    @GetMapping("/proximas-dez")
    public List<Partida> listarProximasDezPartidas() {
        return partidaService.listarProximasDezPartidas();
    }

    @GetMapping("/fase/{fase}")
    public List<Partida> listarPorFase(
            @PathVariable String fase
    ) {
        return partidaService.listarPorFase(fase);
    }

    @GetMapping("/status/{status}")
    public List<Partida> listarPorStatus(
            @PathVariable String status
    ) {
        return partidaService.listarPorStatus(status);
    }

    @GetMapping("/filtro")
    public List<Partida> listarPorFaseEStatus(
            @RequestParam String fase,
            @RequestParam String status
    ) {
        return partidaService.listarPorFaseEStatus(
                fase,
                status
        );
    }

    @GetMapping("/data/{data}")
    public List<Partida> listarPorData(
            @PathVariable LocalDate data
    ) {
        return partidaService.listarPorData(data);
    }

    @GetMapping("/pendentes")
    public long contarPartidasPendentes() {
        return partidaService.contarPartidasPendentesDeResultado();
    }

    @PostMapping
    public Partida cadastrar(
            @RequestBody Partida partida
    ) {
        return partidaService.cadastrar(partida);
    }

    @PutMapping("/{id}")
    public Partida atualizar(
            @PathVariable Long id,
            @RequestBody Partida partida
    ) {
        return partidaService.atualizar(
                id,
                partida
        );
    }

    @PutMapping("/{id}/status")
    public Partida alterarStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return partidaService.alterarStatus(
                id,
                status
        );
    }

    @PutMapping("/{id}/iniciar")
    public Partida iniciarPartida(
            @PathVariable Long id
    ) {
        return partidaService.iniciarPartida(id);
    }

    @PutMapping("/{id}/resultado")
    public Partida lancarResultado(
            @PathVariable Long id,
            @RequestParam Integer golsCasa,
            @RequestParam Integer golsVisitante
    ) {
        return partidaService.lancarResultado(
                id,
                golsCasa,
                golsVisitante
        );
    }

    @PutMapping("/{id}/corrigir-resultado")
    public Partida corrigirResultado(
            @PathVariable Long id,
            @RequestParam Integer golsCasa,
            @RequestParam Integer golsVisitante
    ) {
        return partidaService.corrigirResultado(
                id,
                golsCasa,
                golsVisitante
        );
    }

    @DeleteMapping("/{id}")
    public void excluir(
            @PathVariable Long id
    ) {
        partidaService.excluir(id);
    }

}

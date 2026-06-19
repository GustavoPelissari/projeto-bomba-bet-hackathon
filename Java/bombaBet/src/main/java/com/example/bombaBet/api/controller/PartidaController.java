package com.example.bombaBet.api.controller;

import com.example.bombaBet.api.dto.partida.PartidaResponseDto;
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
    public List<PartidaResponseDto> listarTodas() {
        return partidaService.listarTodas()
                .stream()
                .map(PartidaResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public PartidaResponseDto buscarPorId(
            @PathVariable Long id
    ) {
        return PartidaResponseDto.fromEntity(
                partidaService.buscarPorId(id)
        );
    }

    @GetMapping("/proximas")
    public List<PartidaResponseDto> listarProximasPartidas() {
        return partidaService.listarProximasPartidas()
                .stream()
                .map(PartidaResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/proximas-dez")
    public List<PartidaResponseDto> listarProximasDezPartidas() {
        return partidaService.listarProximasDezPartidas()
                .stream()
                .map(PartidaResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/fase/{fase}")
    public List<PartidaResponseDto> listarPorFase(
            @PathVariable String fase
    ) {
        return partidaService.listarPorFase(fase)
                .stream()
                .map(PartidaResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/status/{status}")
    public List<PartidaResponseDto> listarPorStatus(
            @PathVariable String status
    ) {
        return partidaService.listarPorStatus(status)
                .stream()
                .map(PartidaResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/filtro")
    public List<PartidaResponseDto> listarPorFaseEStatus(
            @RequestParam String fase,
            @RequestParam String status
    ) {
        return partidaService
                .listarPorFaseEStatus(fase, status)
                .stream()
                .map(PartidaResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/data/{data}")
    public List<PartidaResponseDto> listarPorData(
            @PathVariable LocalDate data
    ) {
        return partidaService.listarPorData(data)
                .stream()
                .map(PartidaResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/pendentes")
    public long contarPartidasPendentes() {
        return partidaService.contarPartidasPendentesDeResultado();
    }

    @PostMapping
    public PartidaResponseDto cadastrar(
            @RequestBody Partida partida
    ) {
        return PartidaResponseDto.fromEntity(
                partidaService.cadastrar(partida)
        );
    }

    @PutMapping("/{id}")
    public PartidaResponseDto atualizar(
            @PathVariable Long id,
            @RequestBody Partida partida
    ) {
        return PartidaResponseDto.fromEntity(
                partidaService.atualizar(id, partida)
        );
    }

    @PutMapping("/{id}/status")
    public PartidaResponseDto alterarStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return PartidaResponseDto.fromEntity(
                partidaService.alterarStatus(id, status)
        );
    }

    @PutMapping("/{id}/iniciar")
    public PartidaResponseDto iniciarPartida(
            @PathVariable Long id
    ) {
        return PartidaResponseDto.fromEntity(
                partidaService.iniciarPartida(id)
        );
    }

    @PutMapping("/{id}/resultado")
    public PartidaResponseDto lancarResultado(
            @PathVariable Long id,
            @RequestParam Integer golsCasa,
            @RequestParam Integer golsVisitante
    ) {
        return PartidaResponseDto.fromEntity(
                partidaService.lancarResultado(
                        id,
                        golsCasa,
                        golsVisitante
                )
        );
    }

    @PutMapping("/{id}/corrigir-resultado")
    public PartidaResponseDto corrigirResultado(
            @PathVariable Long id,
            @RequestParam Integer golsCasa,
            @RequestParam Integer golsVisitante
    ) {
        return PartidaResponseDto.fromEntity(
                partidaService.corrigirResultado(
                        id,
                        golsCasa,
                        golsVisitante
                )
        );
    }

    @DeleteMapping("/{id}")
    public void excluir(
            @PathVariable Long id
    ) {
        partidaService.excluir(id);
    }


}

package com.example.bombaBet.api;

import com.example.bombaBet.api.dto.partida.PartidaRequestDto;
import com.example.bombaBet.api.dto.partida.PartidaResponseDto;
import com.example.bombaBet.model.Partida;
import com.example.bombaBet.model.Selecao;
import com.example.bombaBet.service.PartidaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/partidas")
@RequiredArgsConstructor
public class PartidaApi {

    private final PartidaService partidaService;

    @GetMapping
    public ResponseEntity<List<PartidaResponseDto>> listar(
            @RequestParam(required = false) String fase,
            @RequestParam(required = false) String status,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate data
    ) {
        List<Partida> partidas;

        if (data != null) {
            partidas = partidaService.listarPorData(data);

        } else if (fase != null && status != null) {
            partidas = partidaService.listarPorFaseEStatus(fase, status);

        } else if (fase != null) {
            partidas = partidaService.listarPorFase(fase);

        } else if (status != null) {
            partidas = partidaService.listarPorStatus(status);

        } else {
            partidas = partidaService.listarTodas();
        }

        List<PartidaResponseDto> response = partidas
                .stream()
                .map(this::converterParaResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/proximas")
    public ResponseEntity<List<PartidaResponseDto>> listarProximas() {
        List<PartidaResponseDto> response = partidaService
                .listarProximasDezPartidas()
                .stream()
                .map(this::converterParaResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartidaResponseDto> buscarPorId(
            @PathVariable Long id
    ) {
        Partida partida = partidaService.buscarPorId(id);

        return ResponseEntity.ok(
                converterParaResponse(partida)
        );
    }

    @PostMapping
    public ResponseEntity<PartidaResponseDto> cadastrar(
            @Valid @RequestBody PartidaRequestDto request
    ) {
        Partida partida = partidaService.cadastrar(
                converterParaEntidade(request)
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(converterParaResponse(partida));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartidaResponseDto> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody PartidaRequestDto request
    ) {
        Partida partida = partidaService.atualizar(
                id,
                converterParaEntidade(request)
        );

        return ResponseEntity.ok(
                converterParaResponse(partida)
        );
    }

    @PostMapping("/{id}/iniciar")
    public ResponseEntity<PartidaResponseDto> iniciarPartida(
            @PathVariable Long id
    ) {
        Partida partida = partidaService.iniciarPartida(id);

        return ResponseEntity.ok(
                converterParaResponse(partida)
        );
    }

    @PostMapping("/{id}/resultado")
    public ResponseEntity<PartidaResponseDto> lancarResultado(
            @PathVariable Long id,
            @RequestParam Integer golsCasa,
            @RequestParam Integer golsVisitante
    ) {
        Partida partida = partidaService.lancarResultado(
                id,
                golsCasa,
                golsVisitante
        );

        return ResponseEntity.ok(
                converterParaResponse(partida)
        );
    }

    @PutMapping("/{id}/resultado")
    public ResponseEntity<PartidaResponseDto> corrigirResultado(
            @PathVariable Long id,
            @RequestParam Integer golsCasa,
            @RequestParam Integer golsVisitante
    ) {
        Partida partida = partidaService.corrigirResultado(
                id,
                golsCasa,
                golsVisitante
        );

        return ResponseEntity.ok(
                converterParaResponse(partida)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id
    ) {
        partidaService.excluir(id);

        return ResponseEntity.noContent().build();
    }

    private Partida converterParaEntidade(
            PartidaRequestDto request
    ) {
        Selecao selecaoCasa = new Selecao();
        selecaoCasa.setId(request.getSelecaoCasaId());

        Selecao selecaoVisitante = new Selecao();
        selecaoVisitante.setId(request.getSelecaoVisitanteId());

        return Partida.builder()
                .selecaoCasa(selecaoCasa)
                .selecaoVisitante(selecaoVisitante)
                .dataHora(request.getDataHora())
                .estadio(request.getEstadio())
                .fase(request.getFase())
                .grupo(request.getGrupo())
                .build();
    }

    private PartidaResponseDto converterParaResponse(
            Partida partida
    ) {
        return PartidaResponseDto.builder()
                .id(partida.getId())
                .selecaoCasa(
                        partida.getSelecaoCasa() != null
                                ? partida.getSelecaoCasa().getNome()
                                : null
                )
                .selecaoVisitante(
                        partida.getSelecaoVisitante() != null
                                ? partida.getSelecaoVisitante().getNome()
                                : null
                )
                .dataHora(partida.getDataHora())
                .estadio(partida.getEstadio())
                .fase(partida.getFase())
                .grupo(partida.getGrupo()) // estava faltando -> a API não retornava o grupo
                .status(partida.getStatus())
                .golsCasa(partida.getGolsCasa())
                .golsVisitante(partida.getGolsVisitante())
                .build();
    }
}
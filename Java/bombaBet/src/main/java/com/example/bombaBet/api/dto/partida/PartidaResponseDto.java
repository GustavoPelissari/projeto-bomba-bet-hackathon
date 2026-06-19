package com.example.bombaBet.api.dto.partida;

import com.example.bombaBet.model.Partida;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PartidaResponseDto {

    private Long id;

    private String selecaoCasa;

    private String selecaoVisitante;

    private LocalDateTime dataHora;

    private String estadio;

    private String fase;

    private String grupo;

    private String status;

    private Integer golsCasa;

    private Integer golsVisitante;

    public static PartidaResponseDto fromEntity(
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
                .grupo(partida.getGrupo())
                .status(partida.getStatus())
                .golsCasa(partida.getGolsCasa())
                .golsVisitante(partida.getGolsVisitante())
                .build();
    }
}
package com.example.bombaBet.api.dto.partida;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PartidaRequestDto {

    private Long selecaoCasaId;
    private Long selecaoVisitanteId;

    private LocalDateTime dataHora;

    private String estadio;

    private String fase;

    private String grupo;

}
package com.example.bombaBet.api.dto.partida;

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

    private String status;

    private Integer golsCasa;
    private Integer golsVisitante;

}
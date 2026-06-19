package com.example.bombaBet.api.dto.palpite;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PalpiteResponseDto {

    private Long id;

    private Long partidaId;

    private String usuario;

    private Integer golsCasa;

    private Integer golsVisitante;

    private Integer pontuacao;

    private String criterioPontuacao;

}
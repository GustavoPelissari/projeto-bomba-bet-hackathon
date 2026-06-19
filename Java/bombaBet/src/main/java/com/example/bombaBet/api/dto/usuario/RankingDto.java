package com.example.bombaBet.api.dto.usuario;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RankingDto {

    private Integer posicao;

    private String nome;

    private Integer pontuacaoTotal;

    private Integer placaresExatos;

}
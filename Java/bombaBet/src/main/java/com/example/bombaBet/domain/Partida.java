package com.example.bombaBet.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "partidas")
public class Partida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Selecao selecaoCasa;

    @ManyToOne
    private Selecao selecaoVisitante;

    private LocalDateTime dataHora;

    private String estadio;

    private String fase;

    private Integer golsCasa;

    private Integer golsVisitante;
}
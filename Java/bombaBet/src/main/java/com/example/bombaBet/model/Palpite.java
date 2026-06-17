package com.example.bombaBet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "palpites")
public class Palpite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Usuario usuario;

    @ManyToOne
    private Partida partida;

    private Integer golsCasa;

    private Integer golsVisitante;

    private Integer pontos = 0;

}

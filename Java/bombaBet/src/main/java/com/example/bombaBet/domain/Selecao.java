package com.example.bombaBet.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "selecoes")
public class Selecao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String codigoFifa;

    private String grupo;

    private String bandeira;
}
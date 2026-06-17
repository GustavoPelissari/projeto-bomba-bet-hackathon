package com.example.bombaBet.model;

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
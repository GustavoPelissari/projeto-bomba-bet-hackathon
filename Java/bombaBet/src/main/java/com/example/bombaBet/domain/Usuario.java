package com.example.bombaBet.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(unique = true)
    private String email;

    private String senha;

    private String role;

    private Integer pontuacaoTotal = 0;

    private Integer placaresExatos = 0;

    private Boolean ativo = true;

    private LocalDateTime criadoEm = LocalDateTime.now();

}

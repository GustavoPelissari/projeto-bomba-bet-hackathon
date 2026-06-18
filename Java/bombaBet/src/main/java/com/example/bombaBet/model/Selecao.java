package com.example.bombaBet.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "selecoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Selecao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(name = "codigo_fifa", nullable = false, unique = true, length = 3)
    private String codigoFifa;

    @Column(nullable = false, length = 1)
    private String grupo;

    @Column(length = 255)
    private String bandeira;

    @PrePersist
    public void antesDeSalvar() {
        normalizarDados();
    }

    @PreUpdate
    public void antesDeAtualizar() {
        normalizarDados();
    }

    private void normalizarDados() {
        if (codigoFifa != null) {
            codigoFifa = codigoFifa.toUpperCase();
        }

        if (grupo != null) {
            grupo = grupo.toUpperCase();
        }
    }
}
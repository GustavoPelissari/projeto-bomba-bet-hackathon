package com.example.bombaBet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "palpites",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_palpite_usuario_partida",
                        columnNames = {"usuario_id", "partida_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Palpite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "partida_id", nullable = false)
    private Partida partida;

    @Column(name = "gols_casa", nullable = false)
    private Integer golsCasa;

    @Column(name = "gols_visitante", nullable = false)
    private Integer golsVisitante;

    @Column(nullable = false)
    @Builder.Default
    private Integer pontuacao = 0;

    @Column(name = "criterio_pontuacao", nullable = false, length = 30)
    @Builder.Default
    private String criterioPontuacao = "PENDENTE";

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @PrePersist
    public void antesDeSalvar() {
        LocalDateTime agora = LocalDateTime.now();

        criadoEm = agora;
        atualizadoEm = agora;

        normalizarDados();
    }

    @PreUpdate
    public void antesDeAtualizar() {
        atualizadoEm = LocalDateTime.now();

        normalizarDados();
    }

    private void normalizarDados() {
        if (pontuacao == null) {
            pontuacao = 0;
        }

        if (criterioPontuacao == null || criterioPontuacao.isBlank()) {
            criterioPontuacao = "PENDENTE";
        } else {
            criterioPontuacao = criterioPontuacao
                    .trim()
                    .toUpperCase();
        }
    }
}
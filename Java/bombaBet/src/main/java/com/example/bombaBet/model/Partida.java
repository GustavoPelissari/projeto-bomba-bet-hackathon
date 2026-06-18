package com.example.bombaBet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "partidas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "selecao_casa_id", nullable = false)
    private Selecao selecaoCasa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "selecao_visitante_id", nullable = false)
    private Selecao selecaoVisitante;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Column(nullable = false, length = 150)
    private String estadio;

    /*
     * Valores sugeridos:
     * GRUPOS
     * OITAVAS_DE_FINAL
     * QUARTAS_DE_FINAL
     * SEMIFINAL
     * DISPUTA_TERCEIRO_LUGAR
     * FINAL
     */
    @Column(nullable = false, length = 40)
    private String fase;

    /*
     * Utilizado principalmente na fase de grupos.
     * Exemplos: A, B, C, D...
     */
    @Column(length = 1)
    private String grupo;

    /*
     * Valores:
     * AGENDADA
     * EM_ANDAMENTO
     * ENCERRADA
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "AGENDADA";

    /*
     * Os gols ficam nulos enquanto a partida
     * ainda não tiver resultado lançado.
     */
    @Column(name = "gols_casa")
    private Integer golsCasa;

    @Column(name = "gols_visitante")
    private Integer golsVisitante;

    @PrePersist
    public void antesDeSalvar() {
        normalizarDados();
    }

    @PreUpdate
    public void antesDeAtualizar() {
        normalizarDados();
    }

    private void normalizarDados() {
        if (fase != null) {
            fase = fase.trim().toUpperCase();
        }

        if (grupo != null) {
            grupo = grupo.trim().toUpperCase();
        }

        if (status == null || status.isBlank()) {
            status = "AGENDADA";
        } else {
            status = status.trim().toUpperCase();
        }
    }
}
package com.example.bombaBet.repository;

import com.example.bombaBet.model.Partida;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PartidaRepository
        extends JpaRepository<Partida, Long> {

    List<Partida> findByDataHoraAfterOrderByDataHoraAsc(
            LocalDateTime agora
    );

    List<Partida> findByDataHoraBetweenOrderByDataHoraAsc(
            LocalDateTime inicio,
            LocalDateTime fim
    );

    List<Partida> findByFaseIgnoreCaseOrderByDataHoraAsc(
            String fase
    );

    List<Partida> findByStatusIgnoreCaseOrderByDataHoraAsc(
            String status
    );

    List<Partida> findByFaseIgnoreCaseAndStatusIgnoreCaseOrderByDataHoraAsc(
            String fase,
            String status
    );

    List<Partida> findTop10ByDataHoraAfterAndStatusIgnoreCaseOrderByDataHoraAsc(
            LocalDateTime agora,
            String status
    );

    long countByStatusIgnoreCase(
            String status
    );
}
package com.example.bombaBet.repository;

import com.example.bombaBet.model.Partida;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PartidaRepository
        extends JpaRepository<Partida, Long> {

    List<Partida> findByDataHoraAfter(
            LocalDateTime agora
    );

}
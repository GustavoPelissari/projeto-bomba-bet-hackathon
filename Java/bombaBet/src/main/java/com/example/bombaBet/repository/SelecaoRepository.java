package com.example.bombaBet.repository;

import com.example.bombaBet.model.Selecao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SelecaoRepository
        extends JpaRepository<Selecao, Long> {

    Optional<Selecao> findByCodigoFifaIgnoreCase(
            String codigoFifa
    );

    boolean existsByCodigoFifaIgnoreCase(
            String codigoFifa
    );

    List<Selecao> findByNomeContainingIgnoreCase(
            String nome
    );
}
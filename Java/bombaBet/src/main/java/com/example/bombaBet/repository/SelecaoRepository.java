package com.example.bombaBet.repository;

import com.example.bombaBet.model.Selecao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SelecaoRepository
        extends JpaRepository<Selecao, Long> {
}
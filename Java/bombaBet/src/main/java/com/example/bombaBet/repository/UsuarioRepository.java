package com.example.bombaBet.repository;

import com.example.bombaBet.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository
        extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailIgnoreCase(
            String email
    );

    boolean existsByEmailIgnoreCase(
            String email
    );

    List<Usuario> findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String nome,
            String email
    );

    Page<Usuario> findByAtivoTrueOrderByPontuacaoTotalDescPlacaresExatosDescCriadoEmAsc(
            Pageable pageable
    );

    long countByAtivoTrue();

    long countByUltimoAcessoAfter(
            LocalDateTime dataHora
    );
}
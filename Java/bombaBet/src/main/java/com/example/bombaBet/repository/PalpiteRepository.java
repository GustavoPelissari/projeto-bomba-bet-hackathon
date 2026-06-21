package com.example.bombaBet.repository;

import com.example.bombaBet.model.Palpite;
import com.example.bombaBet.model.Partida;
import com.example.bombaBet.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PalpiteRepository
        extends JpaRepository<Palpite, Long> {

    List<Palpite> findByUsuarioOrderByPartidaDataHoraAsc(
            Usuario usuario
    );

    List<Palpite> findByPartida(
            Partida partida
    );

    boolean existsByUsuarioAndPartida(
            Usuario usuario,
            Partida partida
    );

    // Remove todos os palpites de um usuário (usado ao excluir a conta).
    void deleteByUsuario(
            Usuario usuario
    );
}
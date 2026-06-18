package com.example.bombaBet.service;

import com.example.bombaBet.model.Palpite;
import com.example.bombaBet.model.Partida;
import com.example.bombaBet.model.Usuario;
import com.example.bombaBet.repository.PalpiteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PalpiteService {

    private final PalpiteRepository palpiteRepository;
    private final UsuarioService usuarioService;
    private final PartidaService partidaService;

    public List<Palpite> listarTodos() {
        return palpiteRepository.findAll();
    }

    public Palpite buscarPorId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException(
                    "O ID do palpite é obrigatório"
            );
        }

        return palpiteRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Palpite não encontrado com o ID: " + id
                        )
                );
    }

    public List<Palpite> listarPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);

        return palpiteRepository
                .findByUsuarioOrderByPartidaDataHoraAsc(usuario);
    }

    public List<Palpite> listarPorEmailUsuario(String email) {
        Usuario usuario = usuarioService.buscarPorEmail(email);

        return palpiteRepository
                .findByUsuarioOrderByPartidaDataHoraAsc(usuario);
    }

    public List<Palpite> listarPorPartida(Long partidaId) {
        Partida partida = partidaService.buscarPorId(partidaId);

        return palpiteRepository.findByPartida(partida);
    }

    public Palpite buscarPorUsuarioEPartida(
            Long usuarioId,
            Long partidaId
    ) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        Partida partida = partidaService.buscarPorId(partidaId);

        return palpiteRepository
                .findByUsuarioAndPartida(usuario, partida)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "O usuário ainda não possui um palpite para esta partida"
                        )
                );
    }

    public boolean usuarioJaPalpitou(
            Long usuarioId,
            Long partidaId
    ) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        Partida partida = partidaService.buscarPorId(partidaId);

        return palpiteRepository.existsByUsuarioAndPartida(
                usuario,
                partida
        );
    }

    @Transactional
    public Palpite registrar(
            Long usuarioId,
            Long partidaId,
            Integer golsCasa,
            Integer golsVisitante
    ) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        Partida partida = partidaService.buscarPorId(partidaId);

        validarUsuario(usuario);
        validarGols(golsCasa, golsVisitante);
        validarPartidaAbertaParaPalpite(partida);

        if (palpiteRepository.existsByUsuarioAndPartida(
                usuario,
                partida
        )) {
            throw new IllegalStateException(
                    "O usuário já possui um palpite para esta partida"
            );
        }

        Palpite palpite = Palpite.builder()
                .usuario(usuario)
                .partida(partida)
                .golsCasa(golsCasa)
                .golsVisitante(golsVisitante)
                .pontuacao(0)
                .criterioPontuacao("PENDENTE")
                .build();

        try {
            return palpiteRepository.saveAndFlush(palpite);

        } catch (DataIntegrityViolationException exception) {
            throw new IllegalStateException(
                    "Não foi possível registrar o palpite. "
                            + "O usuário pode já possuir um palpite para esta partida",
                    exception
            );
        }
    }

    @Transactional
    public Palpite registrarPorEmail(
            String email,
            Long partidaId,
            Integer golsCasa,
            Integer golsVisitante
    ) {
        Usuario usuario = usuarioService.buscarPorEmail(email);

        return registrar(
                usuario.getId(),
                partidaId,
                golsCasa,
                golsVisitante
        );
    }

    @Transactional
    public Palpite editar(
            Long palpiteId,
            Long usuarioId,
            Integer golsCasa,
            Integer golsVisitante
    ) {
        Palpite palpite = buscarPorId(palpiteId);
        Usuario usuario = usuarioService.buscarPorId(usuarioId);

        validarProprietario(palpite, usuario);
        validarUsuario(usuario);
        validarGols(golsCasa, golsVisitante);
        validarPartidaAbertaParaPalpite(
                palpite.getPartida()
        );

        palpite.setGolsCasa(golsCasa);
        palpite.setGolsVisitante(golsVisitante);

        /*
         * Enquanto a partida não estiver encerrada,
         * o palpite ainda não possui pontuação.
         */
        palpite.setPontuacao(0);
        palpite.setCriterioPontuacao("PENDENTE");

        return palpiteRepository.save(palpite);
    }

    @Transactional
    public Palpite editarPorEmail(
            Long palpiteId,
            String email,
            Integer golsCasa,
            Integer golsVisitante
    ) {
        Usuario usuario = usuarioService.buscarPorEmail(email);

        return editar(
                palpiteId,
                usuario.getId(),
                golsCasa,
                golsVisitante
        );
    }

    @Transactional
    public void excluir(
            Long palpiteId,
            Long usuarioId
    ) {
        Palpite palpite = buscarPorId(palpiteId);
        Usuario usuario = usuarioService.buscarPorId(usuarioId);

        validarProprietario(palpite, usuario);
        validarPartidaAbertaParaPalpite(
                palpite.getPartida()
        );

        palpiteRepository.delete(palpite);
    }

    @Transactional
    public void excluirPorEmail(
            Long palpiteId,
            String email
    ) {
        Usuario usuario = usuarioService.buscarPorEmail(email);

        excluir(
                palpiteId,
                usuario.getId()
        );
    }

    public long contarTodos() {
        return palpiteRepository.count();
    }

    public long contarPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);

        return palpiteRepository.countByUsuario(usuario);
    }

    private void validarUsuario(Usuario usuario) {
        if (usuario == null) {
            throw new IllegalArgumentException(
                    "O usuário é obrigatório"
            );
        }

        if (!usuario.isEnabled()) {
            throw new IllegalStateException(
                    "O usuário está desativado e não pode registrar palpites"
            );
        }

        if (!usuario.isAccountNonLocked()) {
            throw new IllegalStateException(
                    "O usuário está bloqueado e não pode registrar palpites"
            );
        }
    }

    private void validarGols(
            Integer golsCasa,
            Integer golsVisitante
    ) {
        if (golsCasa == null || golsVisitante == null) {
            throw new IllegalArgumentException(
                    "Informe o placar das duas seleções"
            );
        }

        if (golsCasa < 0 || golsVisitante < 0) {
            throw new IllegalArgumentException(
                    "A quantidade de gols não pode ser negativa"
            );
        }

        if (golsCasa > 99 || golsVisitante > 99) {
            throw new IllegalArgumentException(
                    "A quantidade de gols informada é inválida"
            );
        }
    }

    private void validarPartidaAbertaParaPalpite(
            Partida partida
    ) {
        if (partida == null) {
            throw new IllegalArgumentException(
                    "A partida é obrigatória"
            );
        }

        if (partida.getDataHora() == null) {
            throw new IllegalStateException(
                    "A partida não possui data e horário definidos"
            );
        }

        /*
         * A regra exige que o horário atual seja
         * estritamente anterior ao início da partida.
         */
        boolean partidaJaIniciou =
                !LocalDateTime.now().isBefore(
                        partida.getDataHora()
                );

        if (partidaJaIniciou) {
            throw new IllegalStateException(
                    "O prazo para registrar ou editar palpites desta partida foi encerrado"
            );
        }

        if (!"AGENDADA".equalsIgnoreCase(
                partida.getStatus()
        )) {
            throw new IllegalStateException(
                    "Só é possível palpitar em partidas com status AGENDADA"
            );
        }
    }

    private void validarProprietario(
            Palpite palpite,
            Usuario usuario
    ) {
        if (palpite.getUsuario() == null
                || palpite.getUsuario().getId() == null
                || usuario.getId() == null
                || !palpite.getUsuario()
                .getId()
                .equals(usuario.getId())) {

            throw new AccessDeniedException(
                    "O usuário não possui permissão para alterar este palpite"
            );
        }
    }
}
package com.example.bombaBet.service;

import com.example.bombaBet.model.Selecao;
import com.example.bombaBet.repository.SelecaoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SelecaoService {

    private final SelecaoRepository selecaoRepository;

    public List<Selecao> listarTodas() {
        return selecaoRepository.findAll();
    }

    public Selecao buscarPorId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException(
                    "O ID da seleção é obrigatório"
            );
        }

        return selecaoRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Seleção não encontrada com o ID: " + id
                        )
                );
    }

    public Selecao buscarPorCodigoFifa(String codigoFifa) {
        String codigoNormalizado =
                normalizarCodigoFifa(codigoFifa);

        return selecaoRepository
                .findByCodigoFifaIgnoreCase(codigoNormalizado)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Seleção não encontrada com o código FIFA: "
                                        + codigoNormalizado
                        )
                );
    }

    public List<Selecao> pesquisarPorNome(String nome) {
        if (nome == null || nome.isBlank()) {
            return listarTodas();
        }

        return selecaoRepository
                .findByNomeContainingIgnoreCase(
                        nome.trim()
                );
    }

    @Transactional
    public Selecao cadastrar(Selecao selecao) {
        validarSelecao(selecao);

        String codigoNormalizado =
                normalizarCodigoFifa(selecao.getCodigoFifa());

        if (selecaoRepository.existsByCodigoFifaIgnoreCase(
                codigoNormalizado
        )) {
            throw new IllegalArgumentException(
                    "Já existe uma seleção cadastrada com o código FIFA: "
                            + codigoNormalizado
            );
        }

        selecao.setId(null);
        selecao.setNome(normalizarNome(selecao.getNome()));
        selecao.setCodigoFifa(codigoNormalizado);
        selecao.setGrupo(normalizarGrupo(selecao.getGrupo()));
        selecao.setBandeira(normalizarBandeira(selecao.getBandeira()));

        return selecaoRepository.save(selecao);
    }

    @Transactional
    public Selecao atualizar(
            Long id,
            Selecao dadosAtualizados
    ) {
        Selecao selecaoSalva = buscarPorId(id);

        validarSelecao(dadosAtualizados);

        String codigoNormalizado =
                normalizarCodigoFifa(
                        dadosAtualizados.getCodigoFifa()
                );

        Optional<Selecao> selecaoComMesmoCodigo =
                selecaoRepository.findByCodigoFifaIgnoreCase(
                        codigoNormalizado
                );

        if (selecaoComMesmoCodigo.isPresent()
                && !selecaoComMesmoCodigo.get()
                .getId()
                .equals(selecaoSalva.getId())) {

            throw new IllegalArgumentException(
                    "Já existe outra seleção cadastrada com o código FIFA: "
                            + codigoNormalizado
            );
        }

        selecaoSalva.setNome(
                normalizarNome(dadosAtualizados.getNome())
        );

        selecaoSalva.setCodigoFifa(codigoNormalizado);

        selecaoSalva.setGrupo(
                normalizarGrupo(dadosAtualizados.getGrupo())
        );

        if (dadosAtualizados.getBandeira() != null
                && !dadosAtualizados.getBandeira().isBlank()) {

            selecaoSalva.setBandeira(
                    normalizarBandeira(
                            dadosAtualizados.getBandeira()
                    )
            );
        }

        return selecaoRepository.save(selecaoSalva);
    }

    @Transactional
    public Selecao atualizarBandeira(
            Long selecaoId,
            String bandeira
    ) {
        Selecao selecao = buscarPorId(selecaoId);

        if (bandeira == null || bandeira.isBlank()) {
            throw new IllegalArgumentException(
                    "O nome ou caminho da bandeira é obrigatório"
            );
        }

        selecao.setBandeira(
                normalizarBandeira(bandeira)
        );

        return selecaoRepository.save(selecao);
    }

    @Transactional
    public Selecao removerBandeira(Long selecaoId) {
        Selecao selecao = buscarPorId(selecaoId);

        selecao.setBandeira(null);

        return selecaoRepository.save(selecao);
    }

    @Transactional
    public void excluir(Long id) {
        Selecao selecao = buscarPorId(id);

        try {
            selecaoRepository.delete(selecao);
            selecaoRepository.flush();

        } catch (DataIntegrityViolationException exception) {
            throw new IllegalStateException(
                    "Não é possível excluir esta seleção porque ela está vinculada a uma ou mais partidas"
            );
        }
    }

    private void validarSelecao(Selecao selecao) {
        if (selecao == null) {
            throw new IllegalArgumentException(
                    "Os dados da seleção são obrigatórios"
            );
        }

        validarNome(selecao.getNome());
        validarCodigoFifa(selecao.getCodigoFifa());
        validarGrupo(selecao.getGrupo());
    }

    private void validarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException(
                    "O nome da seleção é obrigatório"
            );
        }

        if (nome.trim().length() < 2) {
            throw new IllegalArgumentException(
                    "O nome da seleção deve possuir pelo menos 2 caracteres"
            );
        }

        if (nome.trim().length() > 120) {
            throw new IllegalArgumentException(
                    "O nome da seleção não pode ultrapassar 120 caracteres"
            );
        }
    }

    private void validarCodigoFifa(String codigoFifa) {
        if (codigoFifa == null || codigoFifa.isBlank()) {
            throw new IllegalArgumentException(
                    "O código FIFA é obrigatório"
            );
        }

        String codigoNormalizado =
                codigoFifa.trim().toUpperCase();

        if (!codigoNormalizado.matches("[A-Z]{3}")) {
            throw new IllegalArgumentException(
                    "O código FIFA deve possuir exatamente 3 letras"
            );
        }
    }

    private void validarGrupo(String grupo) {
        if (grupo == null || grupo.isBlank()) {
            throw new IllegalArgumentException(
                    "O grupo da seleção é obrigatório"
            );
        }

        String grupoNormalizado =
                grupo.trim().toUpperCase();

        if (!grupoNormalizado.matches("[A-L]")) {
            throw new IllegalArgumentException(
                    "O grupo deve ser uma letra entre A e L"
            );
        }
    }

    private String normalizarNome(String nome) {
        validarNome(nome);

        return nome.trim();
    }

    private String normalizarCodigoFifa(String codigoFifa) {
        validarCodigoFifa(codigoFifa);

        return codigoFifa
                .trim()
                .toUpperCase();
    }

    private String normalizarGrupo(String grupo) {
        validarGrupo(grupo);

        return grupo
                .trim()
                .toUpperCase();
    }

    private String normalizarBandeira(String bandeira) {
        if (bandeira == null || bandeira.isBlank()) {
            return null;
        }

        return bandeira.trim();
    }
}
package com.example.bombaBet.service;

import com.example.bombaBet.model.Selecao;
import com.example.bombaBet.repository.SelecaoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SelecaoService {

    private final SelecaoRepository selecaoRepository;

    // ---------------- Consultas ----------------

    public List<Selecao> listarTodas() {
        return selecaoRepository.findAll();
    }

    public Selecao buscarPorId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("O ID da seleção é obrigatório");
        }
        return selecaoRepository.findById(id).orElseThrow(() ->
                new EntityNotFoundException("Seleção não encontrada com o ID: " + id));
    }

    public Selecao buscarPorCodigoFifa(String codigoFifa) {
        String codigo = normalizarCodigoFifa(codigoFifa);
        return selecaoRepository.findByCodigoFifaIgnoreCase(codigo).orElseThrow(() ->
                new EntityNotFoundException("Seleção não encontrada com o código FIFA: " + codigo));
    }

    public List<Selecao> pesquisarPorNome(String nome) {
        if (nome == null || nome.isBlank()) {
            return listarTodas();
        }
        return selecaoRepository.findByNomeContainingIgnoreCase(nome.trim());
    }

    // ---------------- Cadastro / edição ----------------

    @Transactional
    public Selecao cadastrar(Selecao selecao) {
        validarSelecao(selecao);
        String codigo = normalizarCodigoFifa(selecao.getCodigoFifa());

        if (selecaoRepository.existsByCodigoFifaIgnoreCase(codigo)) {
            throw new IllegalArgumentException(
                    "Já existe uma seleção cadastrada com o código FIFA: " + codigo);
        }

        selecao.setId(null);
        selecao.setNome(normalizarNome(selecao.getNome()));
        selecao.setCodigoFifa(codigo);
        selecao.setGrupo(normalizarGrupo(selecao.getGrupo()));
        selecao.setBandeira(normalizarBandeira(selecao.getBandeira()));

        return selecaoRepository.save(selecao);
    }

    @Transactional
    public Selecao atualizar(Long id, Selecao dados) {
        Selecao selecao = buscarPorId(id);
        validarSelecao(dados);
        String codigo = normalizarCodigoFifa(dados.getCodigoFifa());

        // Garante que o código FIFA não pertença a OUTRA seleção.
        selecaoRepository.findByCodigoFifaIgnoreCase(codigo).ifPresent(outra -> {
            if (!outra.getId().equals(selecao.getId())) {
                throw new IllegalArgumentException(
                        "Já existe outra seleção cadastrada com o código FIFA: " + codigo);
            }
        });

        selecao.setNome(normalizarNome(dados.getNome()));
        selecao.setCodigoFifa(codigo);
        selecao.setGrupo(normalizarGrupo(dados.getGrupo()));
        // A bandeira só é trocada quando uma nova é informada.
        if (dados.getBandeira() != null && !dados.getBandeira().isBlank()) {
            selecao.setBandeira(normalizarBandeira(dados.getBandeira()));
        }

        return selecaoRepository.save(selecao);
    }

    @Transactional
    public Selecao atualizarBandeira(Long selecaoId, String bandeira) {
        Selecao selecao = buscarPorId(selecaoId);
        if (bandeira == null || bandeira.isBlank()) {
            throw new IllegalArgumentException("O nome ou caminho da bandeira é obrigatório");
        }
        selecao.setBandeira(normalizarBandeira(bandeira));
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
                    "Não é possível excluir esta seleção porque ela está vinculada a uma ou mais partidas");
        }
    }

    // ---------------- Validações / normalizações ----------------

    private void validarSelecao(Selecao selecao) {
        if (selecao == null) {
            throw new IllegalArgumentException("Os dados da seleção são obrigatórios");
        }
        validarNome(selecao.getNome());
        validarCodigoFifa(selecao.getCodigoFifa());
        validarGrupo(selecao.getGrupo());
    }

    private void validarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("O nome da seleção é obrigatório");
        }
        int tamanho = nome.trim().length();
        if (tamanho < 2) {
            throw new IllegalArgumentException("O nome da seleção deve possuir pelo menos 2 caracteres");
        }
        if (tamanho > 120) {
            throw new IllegalArgumentException("O nome da seleção não pode ultrapassar 120 caracteres");
        }
    }

    private void validarCodigoFifa(String codigoFifa) {
        if (codigoFifa == null || codigoFifa.isBlank()) {
            throw new IllegalArgumentException("O código FIFA é obrigatório");
        }
        if (!codigoFifa.trim().toUpperCase().matches("[A-Z]{3}")) {
            throw new IllegalArgumentException("O código FIFA deve possuir exatamente 3 letras");
        }
    }

    private void validarGrupo(String grupo) {
        if (grupo == null || grupo.isBlank()) {
            throw new IllegalArgumentException("O grupo da seleção é obrigatório");
        }
        if (!grupo.trim().toUpperCase().matches("[A-L]")) {
            throw new IllegalArgumentException("O grupo deve ser uma letra entre A e L");
        }
    }

    private String normalizarNome(String nome) {
        validarNome(nome);
        return nome.trim();
    }

    private String normalizarCodigoFifa(String codigoFifa) {
        validarCodigoFifa(codigoFifa);
        return codigoFifa.trim().toUpperCase();
    }

    private String normalizarGrupo(String grupo) {
        validarGrupo(grupo);
        return grupo.trim().toUpperCase();
    }

    private String normalizarBandeira(String bandeira) {
        return (bandeira == null || bandeira.isBlank()) ? null : bandeira.trim();
    }
}

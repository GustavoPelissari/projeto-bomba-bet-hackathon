package com.example.bombaBet.service;

import com.example.bombaBet.model.Palpite;
import com.example.bombaBet.model.Partida;
import com.example.bombaBet.model.Selecao;
import com.example.bombaBet.model.Usuario;
import com.example.bombaBet.repository.PalpiteRepository;
import com.example.bombaBet.repository.PartidaRepository;
import com.example.bombaBet.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PartidaService {

    private static final Set<String> FASES_PERMITIDAS = Set.of(
            "GRUPOS",
            "OITAVAS_DE_FINAL",
            "QUARTAS_DE_FINAL",
            "SEMIFINAL",
            "DISPUTA_TERCEIRO_LUGAR",
            "FINAL"
    );

    private static final Set<String> STATUS_PERMITIDOS = Set.of(
            "AGENDADA",
            "EM_ANDAMENTO",
            "ENCERRADA"
    );

    private final PartidaRepository partidaRepository;
    private final PalpiteRepository palpiteRepository;
    private final UsuarioRepository usuarioRepository;
    private final SelecaoService selecaoService;

    public List<Partida> listarTodas() {
        return partidaRepository.findAll(
                Sort.by(
                        Sort.Direction.ASC,
                        "dataHora"
                )
        );
    }

    public Partida buscarPorId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException(
                    "O ID da partida é obrigatório"
            );
        }

        return partidaRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Partida não encontrada com o ID: " + id
                        )
                );
    }

    public List<Partida> listarProximasPartidas() {
        return partidaRepository
                .findByDataHoraAfterOrderByDataHoraAsc(
                        LocalDateTime.now()
                );
    }

    public List<Partida> listarProximasDezPartidas() {
        return partidaRepository
                .findTop10ByDataHoraAfterAndStatusIgnoreCaseOrderByDataHoraAsc(
                        LocalDateTime.now(),
                        "AGENDADA"
                );
    }

    public List<Partida> listarPorFase(String fase) {
        String faseNormalizada = normalizarFase(fase);

        return partidaRepository
                .findByFaseIgnoreCaseOrderByDataHoraAsc(
                        faseNormalizada
                );
    }

    public List<Partida> listarPorStatus(String status) {
        String statusNormalizado = normalizarStatus(status);

        return partidaRepository
                .findByStatusIgnoreCaseOrderByDataHoraAsc(
                        statusNormalizado
                );
    }

    public List<Partida> listarPorFaseEStatus(
            String fase,
            String status
    ) {
        String faseNormalizada = normalizarFase(fase);
        String statusNormalizado = normalizarStatus(status);

        return partidaRepository
                .findByFaseIgnoreCaseAndStatusIgnoreCaseOrderByDataHoraAsc(
                        faseNormalizada,
                        statusNormalizado
                );
    }

    public List<Partida> listarPorData(LocalDate data) {
        if (data == null) {
            throw new IllegalArgumentException(
                    "A data é obrigatória"
            );
        }

        LocalDateTime inicio = data.atStartOfDay();
        LocalDateTime fim = data.plusDays(1).atStartOfDay();

        return partidaRepository
                .findByDataHoraBetweenOrderByDataHoraAsc(
                        inicio,
                        fim
                );
    }

    public long contarPartidasPendentesDeResultado() {
        return partidaRepository.countByStatusIgnoreCase(
                "AGENDADA"
        );
    }

    @Transactional
    public Partida cadastrar(Partida partida) {
        validarPartida(partida, true);

        Selecao selecaoCasa = buscarSelecao(
                partida.getSelecaoCasa(),
                "A seleção da casa é obrigatória"
        );

        Selecao selecaoVisitante = buscarSelecao(
                partida.getSelecaoVisitante(),
                "A seleção visitante é obrigatória"
        );

        validarSelecoesDiferentes(
                selecaoCasa,
                selecaoVisitante
        );

        partida.setId(null);
        partida.setSelecaoCasa(selecaoCasa);
        partida.setSelecaoVisitante(selecaoVisitante);
        partida.setEstadio(partida.getEstadio().trim());
        partida.setFase(normalizarFase(partida.getFase()));
        partida.setGrupo(
                normalizarGrupo(
                        partida.getGrupo(),
                        partida.getFase()
                )
        );

        partida.setStatus("AGENDADA");
        partida.setGolsCasa(null);
        partida.setGolsVisitante(null);

        return partidaRepository.save(partida);
    }

    @Transactional
    public Partida atualizar(
            Long id,
            Partida dadosAtualizados
    ) {
        Partida partidaSalva = buscarPorId(id);

        if ("ENCERRADA".equalsIgnoreCase(
                partidaSalva.getStatus()
        )) {
            throw new IllegalStateException(
                    "Uma partida encerrada não pode ser alterada por este método"
            );
        }

        validarPartida(dadosAtualizados, false);

        Selecao selecaoCasa = buscarSelecao(
                dadosAtualizados.getSelecaoCasa(),
                "A seleção da casa é obrigatória"
        );

        Selecao selecaoVisitante = buscarSelecao(
                dadosAtualizados.getSelecaoVisitante(),
                "A seleção visitante é obrigatória"
        );

        validarSelecoesDiferentes(
                selecaoCasa,
                selecaoVisitante
        );

        String faseNormalizada =
                normalizarFase(dadosAtualizados.getFase());

        partidaSalva.setSelecaoCasa(selecaoCasa);
        partidaSalva.setSelecaoVisitante(selecaoVisitante);
        partidaSalva.setDataHora(
                dadosAtualizados.getDataHora()
        );
        partidaSalva.setEstadio(
                dadosAtualizados.getEstadio().trim()
        );
        partidaSalva.setFase(faseNormalizada);
        partidaSalva.setGrupo(
                normalizarGrupo(
                        dadosAtualizados.getGrupo(),
                        faseNormalizada
                )
        );

        return partidaRepository.save(partidaSalva);
    }

    @Transactional
    public Partida alterarStatus(
            Long id,
            String novoStatus
    ) {
        Partida partida = buscarPorId(id);

        String statusNormalizado =
                normalizarStatus(novoStatus);

        if ("ENCERRADA".equals(statusNormalizado)
                && (partida.getGolsCasa() == null
                || partida.getGolsVisitante() == null)) {

            throw new IllegalStateException(
                    "Não é possível encerrar uma partida sem informar o resultado"
            );
        }

        partida.setStatus(statusNormalizado);

        return partidaRepository.save(partida);
    }

    @Transactional
    public Partida iniciarPartida(Long id) {
        Partida partida = buscarPorId(id);

        if ("ENCERRADA".equalsIgnoreCase(
                partida.getStatus()
        )) {
            throw new IllegalStateException(
                    "Uma partida encerrada não pode ser iniciada novamente"
            );
        }

        partida.setStatus("EM_ANDAMENTO");

        return partidaRepository.save(partida);
    }

    @Transactional
    public Partida lancarResultado(
            Long partidaId,
            Integer golsCasa,
            Integer golsVisitante
    ) {
        Partida partida = buscarPorId(partidaId);

        validarGols(golsCasa, golsVisitante);

        partida.setGolsCasa(golsCasa);
        partida.setGolsVisitante(golsVisitante);
        partida.setStatus("ENCERRADA");

        Partida partidaSalva =
                partidaRepository.save(partida);

        recalcularPalpitesDaPartida(partidaSalva);

        return partidaSalva;
    }

    @Transactional
    public Partida corrigirResultado(
            Long partidaId,
            Integer golsCasa,
            Integer golsVisitante
    ) {
        Partida partida = buscarPorId(partidaId);

        if (!"ENCERRADA".equalsIgnoreCase(
                partida.getStatus()
        )) {
            throw new IllegalStateException(
                    "A partida ainda não possui um resultado encerrado para ser corrigido"
            );
        }

        return lancarResultado(
                partidaId,
                golsCasa,
                golsVisitante
        );
    }

    @Transactional
    public void excluir(Long id) {
        Partida partida = buscarPorId(id);

        List<Palpite> palpites =
                palpiteRepository.findByPartida(partida);

        if (!palpites.isEmpty()) {
            throw new IllegalStateException(
                    "Não é possível excluir uma partida que possui palpites cadastrados"
            );
        }

        partidaRepository.delete(partida);
    }

    private void recalcularPalpitesDaPartida(
            Partida partida
    ) {
        List<Palpite> palpites =
                palpiteRepository.findByPartida(partida);

        List<Usuario> usuariosAfetados =
                new ArrayList<>();

        for (Palpite palpite : palpites) {
            int pontuacaoAnterior =
                    palpite.getPontuacao() == null
                            ? 0
                            : palpite.getPontuacao();

            boolean eraPlacarExato =
                    "PLACAR_EXATO".equalsIgnoreCase(
                            palpite.getCriterioPontuacao()
                    );

            ResultadoPontuacao novoResultado =
                    calcularPontuacao(
                            palpite,
                            partida
                    );

            Usuario usuario = palpite.getUsuario();

            int novaPontuacaoTotal =
                    valorOuZero(usuario.getPontuacaoTotal())
                            - pontuacaoAnterior
                            + novoResultado.pontos();

            int novosPlacaresExatos =
                    valorOuZero(usuario.getPlacaresExatos());

            if (eraPlacarExato) {
                novosPlacaresExatos--;
            }

            if ("PLACAR_EXATO".equals(
                    novoResultado.criterio()
            )) {
                novosPlacaresExatos++;
            }

            usuario.setPontuacaoTotal(
                    Math.max(0, novaPontuacaoTotal)
            );

            usuario.setPlacaresExatos(
                    Math.max(0, novosPlacaresExatos)
            );

            palpite.setPontuacao(
                    novoResultado.pontos()
            );

            palpite.setCriterioPontuacao(
                    novoResultado.criterio()
            );

            usuariosAfetados.add(usuario);
        }

        palpiteRepository.saveAll(palpites);
        usuarioRepository.saveAll(usuariosAfetados);
    }

    private ResultadoPontuacao calcularPontuacao(
            Palpite palpite,
            Partida partida
    ) {
        boolean placarExato =
                palpite.getGolsCasa()
                        .equals(partida.getGolsCasa())
                        && palpite.getGolsVisitante()
                        .equals(partida.getGolsVisitante());

        if (placarExato) {
            return new ResultadoPontuacao(
                    10,
                    "PLACAR_EXATO"
            );
        }

        int resultadoPalpite = Integer.compare(
                palpite.getGolsCasa(),
                palpite.getGolsVisitante()
        );

        int resultadoPartida = Integer.compare(
                partida.getGolsCasa(),
                partida.getGolsVisitante()
        );

        if (resultadoPalpite == resultadoPartida) {
            return new ResultadoPontuacao(
                    5,
                    "VENCEDOR_OU_EMPATE"
            );
        }

        return new ResultadoPontuacao(
                0,
                "ERRO_TOTAL"
        );
    }

    private void validarPartida(
            Partida partida,
            boolean cadastro
    ) {
        if (partida == null) {
            throw new IllegalArgumentException(
                    "Os dados da partida são obrigatórios"
            );
        }

        if (partida.getDataHora() == null) {
            throw new IllegalArgumentException(
                    "A data e a hora da partida são obrigatórias"
            );
        }

        if (cadastro
                && !partida.getDataHora()
                .isAfter(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "A partida deve ser cadastrada com uma data futura"
            );
        }

        if (partida.getEstadio() == null
                || partida.getEstadio().isBlank()) {

            throw new IllegalArgumentException(
                    "O estádio é obrigatório"
            );
        }

        if (partida.getEstadio().trim().length() > 150) {
            throw new IllegalArgumentException(
                    "O estádio não pode ultrapassar 150 caracteres"
            );
        }

        normalizarFase(partida.getFase());
    }

    private Selecao buscarSelecao(
            Selecao selecao,
            String mensagem
    ) {
        if (selecao == null || selecao.getId() == null) {
            throw new IllegalArgumentException(mensagem);
        }

        return selecaoService.buscarPorId(
                selecao.getId()
        );
    }

    private void validarSelecoesDiferentes(
            Selecao selecaoCasa,
            Selecao selecaoVisitante
    ) {
        if (selecaoCasa.getId().equals(
                selecaoVisitante.getId()
        )) {
            throw new IllegalArgumentException(
                    "A seleção da casa não pode ser igual à seleção visitante"
            );
        }
    }

    private void validarGols(
            Integer golsCasa,
            Integer golsVisitante
    ) {
        if (golsCasa == null || golsVisitante == null) {
            throw new IllegalArgumentException(
                    "Os gols das duas seleções são obrigatórios"
            );
        }

        if (golsCasa < 0 || golsVisitante < 0) {
            throw new IllegalArgumentException(
                    "A quantidade de gols não pode ser negativa"
            );
        }
    }

    private String normalizarFase(String fase) {
        if (fase == null || fase.isBlank()) {
            throw new IllegalArgumentException(
                    "A fase da partida é obrigatória"
            );
        }

        String faseNormalizada = fase
                .trim()
                .toUpperCase()
                .replace(" ", "_");

        if (!FASES_PERMITIDAS.contains(
                faseNormalizada
        )) {
            throw new IllegalArgumentException(
                    "Fase da partida inválida"
            );
        }

        return faseNormalizada;
    }

    private String normalizarStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException(
                    "O status da partida é obrigatório"
            );
        }

        String statusNormalizado = status
                .trim()
                .toUpperCase()
                .replace(" ", "_");

        if (!STATUS_PERMITIDOS.contains(
                statusNormalizado
        )) {
            throw new IllegalArgumentException(
                    "Status da partida inválido"
            );
        }

        return statusNormalizado;
    }

    private String normalizarGrupo(
            String grupo,
            String fase
    ) {
        if (!"GRUPOS".equalsIgnoreCase(fase)) {
            return null;
        }

        if (grupo == null || grupo.isBlank()) {
            throw new IllegalArgumentException(
                    "O grupo é obrigatório para partidas da fase de grupos"
            );
        }

        String grupoNormalizado =
                grupo.trim().toUpperCase();

        if (!grupoNormalizado.matches("[A-L]")) {
            throw new IllegalArgumentException(
                    "O grupo deve ser uma letra entre A e L"
            );
        }

        return grupoNormalizado;
    }

    private int valorOuZero(Integer valor) {
        return valor == null ? 0 : valor;
    }

    private record ResultadoPontuacao(
            int pontos,
            String criterio
    ) {
    }
}
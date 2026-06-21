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
            "GRUPOS", "DEZESSEIS_AVOS_DE_FINAL", "OITAVAS_DE_FINAL",
            "QUARTAS_DE_FINAL", "SEMIFINAL", "DISPUTA_TERCEIRO_LUGAR", "FINAL"
    );

    private static final Set<String> STATUS_PERMITIDOS = Set.of(
            "AGENDADA", "EM_ANDAMENTO", "ENCERRADA"
    );

    private final PartidaRepository partidaRepository;
    private final PalpiteRepository palpiteRepository;
    private final UsuarioRepository usuarioRepository;
    private final SelecaoService selecaoService;

    // ---------------- Consultas ----------------

    public List<Partida> listarTodas() {
        return partidaRepository.findAll(Sort.by(Sort.Direction.ASC, "dataHora"));
    }

    public Partida buscarPorId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("O ID da partida é obrigatório");
        }
        return partidaRepository.findById(id).orElseThrow(() ->
                new EntityNotFoundException("Partida não encontrada com o ID: " + id));
    }

    public List<Partida> listarProximasDezPartidas() {
        return partidaRepository.findTop10ByDataHoraAfterAndStatusIgnoreCaseOrderByDataHoraAsc(
                LocalDateTime.now(), "AGENDADA");
    }

    public List<Partida> listarPorFase(String fase) {
        return partidaRepository.findByFaseIgnoreCaseOrderByDataHoraAsc(normalizarFase(fase));
    }

    public List<Partida> listarPorStatus(String status) {
        return partidaRepository.findByStatusIgnoreCaseOrderByDataHoraAsc(normalizarStatus(status));
    }

    public List<Partida> listarPorFaseEStatus(String fase, String status) {
        return partidaRepository.findByFaseIgnoreCaseAndStatusIgnoreCaseOrderByDataHoraAsc(
                normalizarFase(fase), normalizarStatus(status));
    }

    public List<Partida> listarPorData(LocalDate data) {
        if (data == null) {
            throw new IllegalArgumentException("A data é obrigatória");
        }
        return partidaRepository.findByDataHoraBetweenOrderByDataHoraAsc(
                data.atStartOfDay(), data.plusDays(1).atStartOfDay());
    }

    // ---------------- Cadastro / edição ----------------

    @Transactional
    public Partida cadastrar(Partida partida) {
        validarPartida(partida, true);
        aplicarSelecoes(partida, partida);

        String fase = normalizarFase(partida.getFase());
        partida.setId(null);
        partida.setEstadio(partida.getEstadio().trim());
        partida.setFase(fase);
        partida.setGrupo(normalizarGrupo(partida.getGrupo(), fase));
        partida.setStatus("AGENDADA");
        partida.setGolsCasa(null);
        partida.setGolsVisitante(null);

        return partidaRepository.save(partida);
    }

    @Transactional
    public Partida atualizar(Long id, Partida dados) {
        Partida partida = buscarPorId(id);
        if ("ENCERRADA".equalsIgnoreCase(partida.getStatus())) {
            throw new IllegalStateException(
                    "Uma partida encerrada não pode ser alterada por este método");
        }

        validarPartida(dados, false);
        aplicarSelecoes(partida, dados);

        String fase = normalizarFase(dados.getFase());
        partida.setDataHora(dados.getDataHora());
        partida.setEstadio(dados.getEstadio().trim());
        partida.setFase(fase);
        partida.setGrupo(normalizarGrupo(dados.getGrupo(), fase));

        return partidaRepository.save(partida);
    }

    @Transactional
    public Partida iniciarPartida(Long id) {
        Partida partida = buscarPorId(id);
        if ("ENCERRADA".equalsIgnoreCase(partida.getStatus())) {
            throw new IllegalStateException(
                    "Uma partida encerrada não pode ser iniciada novamente");
        }
        partida.setStatus("EM_ANDAMENTO");
        return partidaRepository.save(partida);
    }

    @Transactional
    public Partida lancarResultado(Long partidaId, Integer golsCasa, Integer golsVisitante) {
        Partida partida = buscarPorId(partidaId);
        validarGols(golsCasa, golsVisitante);

        partida.setGolsCasa(golsCasa);
        partida.setGolsVisitante(golsVisitante);
        partida.setStatus("ENCERRADA");

        Partida salva = partidaRepository.save(partida);
        recalcularPalpitesDaPartida(salva);
        return salva;
    }

    @Transactional
    public Partida corrigirResultado(Long partidaId, Integer golsCasa, Integer golsVisitante) {
        Partida partida = buscarPorId(partidaId);
        if (!"ENCERRADA".equalsIgnoreCase(partida.getStatus())) {
            throw new IllegalStateException(
                    "A partida ainda não possui um resultado encerrado para ser corrigido");
        }
        return lancarResultado(partidaId, golsCasa, golsVisitante);
    }

    // Salva o placar parcial e deixa a partida AO VIVO (EM_ANDAMENTO).
    // NÃO recalcula palpites -> partidas ao vivo não geram pontos.
    @Transactional
    public Partida atualizarPlacarAoVivo(Long partidaId, Integer golsCasa, Integer golsVisitante) {
        Partida partida = buscarPorId(partidaId);
        validarGols(golsCasa, golsVisitante);

        partida.setGolsCasa(golsCasa);
        partida.setGolsVisitante(golsVisitante);
        partida.setStatus("EM_ANDAMENTO");

        return partidaRepository.save(partida);
    }

    @Transactional
    public void excluir(Long id) {
        Partida partida = buscarPorId(id);
        if (!palpiteRepository.findByPartida(partida).isEmpty()) {
            throw new IllegalStateException(
                    "Não é possível excluir uma partida que possui palpites cadastrados");
        }
        partidaRepository.delete(partida);
    }

    // ---------------- Pontuação ----------------

    // Recalcula a pontuação de todos os palpites da partida e ajusta o total
    // (pontos e placares exatos) de cada usuário afetado, numa única transação.
    private void recalcularPalpitesDaPartida(Partida partida) {
        List<Palpite> palpites = palpiteRepository.findByPartida(partida);
        List<Usuario> afetados = new ArrayList<>();

        for (Palpite palpite : palpites) {
            int pontuacaoAnterior = valorOuZero(palpite.getPontuacao());
            boolean eraPlacarExato = "PLACAR_EXATO".equalsIgnoreCase(palpite.getCriterioPontuacao());

            ResultadoPontuacao novo = calcularPontuacao(palpite, partida);
            Usuario usuario = palpite.getUsuario();

            int totalPontos = valorOuZero(usuario.getPontuacaoTotal())
                    - pontuacaoAnterior + novo.pontos();
            int totalExatos = valorOuZero(usuario.getPlacaresExatos())
                    - (eraPlacarExato ? 1 : 0)
                    + ("PLACAR_EXATO".equals(novo.criterio()) ? 1 : 0);

            usuario.setPontuacaoTotal(Math.max(0, totalPontos));
            usuario.setPlacaresExatos(Math.max(0, totalExatos));
            palpite.setPontuacao(novo.pontos());
            palpite.setCriterioPontuacao(novo.criterio());
            afetados.add(usuario);
        }

        palpiteRepository.saveAll(palpites);
        usuarioRepository.saveAll(afetados);
    }

    // Regra: placar exato = 10; acerto do vencedor/empate = 5; erro = 0.
    private ResultadoPontuacao calcularPontuacao(Palpite palpite, Partida partida) {
        boolean placarExato = palpite.getGolsCasa().equals(partida.getGolsCasa())
                && palpite.getGolsVisitante().equals(partida.getGolsVisitante());
        if (placarExato) {
            return new ResultadoPontuacao(10, "PLACAR_EXATO");
        }

        int sinalPalpite = Integer.compare(palpite.getGolsCasa(), palpite.getGolsVisitante());
        int sinalPartida = Integer.compare(partida.getGolsCasa(), partida.getGolsVisitante());
        if (sinalPalpite == sinalPartida) {
            return new ResultadoPontuacao(5, "VENCEDOR_OU_EMPATE");
        }
        return new ResultadoPontuacao(0, "ERRO_TOTAL");
    }

    // ---------------- Validações / normalizações ----------------

    // Resolve as seleções (por id) na partida "alvo" a partir dos dados em "fonte".
    private void aplicarSelecoes(Partida alvo, Partida fonte) {
        Selecao casa = buscarSelecao(fonte.getSelecaoCasa(), "A seleção da casa é obrigatória");
        Selecao visitante = buscarSelecao(fonte.getSelecaoVisitante(), "A seleção visitante é obrigatória");
        if (casa.getId().equals(visitante.getId())) {
            throw new IllegalArgumentException(
                    "A seleção da casa não pode ser igual à seleção visitante");
        }
        alvo.setSelecaoCasa(casa);
        alvo.setSelecaoVisitante(visitante);
    }

    private void validarPartida(Partida partida, boolean cadastro) {
        if (partida == null) {
            throw new IllegalArgumentException("Os dados da partida são obrigatórios");
        }
        if (partida.getDataHora() == null) {
            throw new IllegalArgumentException("A data e a hora da partida são obrigatórias");
        }
        if (cadastro && !partida.getDataHora().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("A partida deve ser cadastrada com uma data futura");
        }
        if (partida.getEstadio() == null || partida.getEstadio().isBlank()) {
            throw new IllegalArgumentException("O estádio é obrigatório");
        }
        if (partida.getEstadio().trim().length() > 150) {
            throw new IllegalArgumentException("O estádio não pode ultrapassar 150 caracteres");
        }
        normalizarFase(partida.getFase());
    }

    private Selecao buscarSelecao(Selecao selecao, String mensagem) {
        if (selecao == null || selecao.getId() == null) {
            throw new IllegalArgumentException(mensagem);
        }
        return selecaoService.buscarPorId(selecao.getId());
    }

    private void validarGols(Integer golsCasa, Integer golsVisitante) {
        if (golsCasa == null || golsVisitante == null) {
            throw new IllegalArgumentException("Os gols das duas seleções são obrigatórios");
        }
        if (golsCasa < 0 || golsVisitante < 0) {
            throw new IllegalArgumentException("A quantidade de gols não pode ser negativa");
        }
    }

    private String normalizarFase(String fase) {
        String valor = normalizarToken(fase, "A fase da partida é obrigatória");
        if (!FASES_PERMITIDAS.contains(valor)) {
            throw new IllegalArgumentException("Fase da partida inválida");
        }
        return valor;
    }

    private String normalizarStatus(String status) {
        String valor = normalizarToken(status, "O status da partida é obrigatório");
        if (!STATUS_PERMITIDOS.contains(valor)) {
            throw new IllegalArgumentException("Status da partida inválido");
        }
        return valor;
    }

    // Tira espaços, deixa em maiúsculas e troca espaços por "_".
    private String normalizarToken(String valor, String mensagemObrigatorio) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(mensagemObrigatorio);
        }
        return valor.trim().toUpperCase().replace(" ", "_");
    }

    private String normalizarGrupo(String grupo, String fase) {
        if (!"GRUPOS".equalsIgnoreCase(fase)) {
            return null; // grupo só faz sentido na fase de grupos
        }
        if (grupo == null || grupo.isBlank()) {
            throw new IllegalArgumentException(
                    "O grupo é obrigatório para partidas da fase de grupos");
        }
        String valor = grupo.trim().toUpperCase();
        if (!valor.matches("[A-L]")) {
            throw new IllegalArgumentException("O grupo deve ser uma letra entre A e L");
        }
        return valor;
    }

    private int valorOuZero(Integer valor) {
        return valor == null ? 0 : valor;
    }

    private record ResultadoPontuacao(int pontos, String criterio) {
    }
}

package com.example.bombaBet.web.controller;

import com.example.bombaBet.model.Partida;
import com.example.bombaBet.model.Selecao;
import com.example.bombaBet.service.PartidaService;
import com.example.bombaBet.service.SelecaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/partidas")
public class PartidaViewController {

    private final PartidaService partidaService;
    private final SelecaoService selecaoService;

    // Lista todas as partidas.
    @GetMapping
    public String listar(Model model) {
        model.addAttribute("partidas", partidaService.listarTodas());
        return "admin/partidas/lista";
    }

    // Formulário de nova partida (precisa de uma partida vazia + a lista de seleções).
    @GetMapping("/nova")
    public String formulario(Model model) {
        model.addAttribute("partida", new Partida());
        model.addAttribute("selecoes", selecaoService.listarTodas());
        return "admin/partidas/form";
    }

    // Salva uma nova partida (POST do formulário).
    @PostMapping
    public String salvar(
            @RequestParam Long selecaoCasaId,
            @RequestParam Long selecaoVisitanteId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm") LocalDateTime dataHora,
            @RequestParam String estadio,
            @RequestParam String fase,
            @RequestParam(required = false) String grupo,
            Model model
    ) {
        try {
            partidaService.cadastrar(
                    montarPartida(selecaoCasaId, selecaoVisitanteId, dataHora, estadio, fase, grupo)
            );
            return "redirect:/admin/partidas";
        } catch (RuntimeException e) {
            // Em caso de erro de validação, volta ao formulário mostrando a mensagem.
            model.addAttribute("erro", e.getMessage());
            model.addAttribute("partida", new Partida());
            model.addAttribute("selecoes", selecaoService.listarTodas());
            return "admin/partidas/form";
        }
    }

    // Formulário de edição (carrega a partida existente + seleções).
    @GetMapping("/{id}/editar")
    public String editar(@PathVariable Long id, Model model) {
        model.addAttribute("partida", partidaService.buscarPorId(id));
        model.addAttribute("selecoes", selecaoService.listarTodas());
        return "admin/partidas/form";
    }

    // Salva a edição de uma partida existente.
    @PostMapping("/{id}/editar")
    public String atualizar(
            @PathVariable Long id,
            @RequestParam Long selecaoCasaId,
            @RequestParam Long selecaoVisitanteId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm") LocalDateTime dataHora,
            @RequestParam String estadio,
            @RequestParam String fase,
            @RequestParam(required = false) String grupo,
            Model model
    ) {
        try {
            partidaService.atualizar(
                    id,
                    montarPartida(selecaoCasaId, selecaoVisitanteId, dataHora, estadio, fase, grupo)
            );
            return "redirect:/admin/partidas";
        } catch (RuntimeException e) {
            model.addAttribute("erro", e.getMessage());
            model.addAttribute("partida", partidaService.buscarPorId(id));
            model.addAttribute("selecoes", selecaoService.listarTodas());
            return "admin/partidas/form";
        }
    }

    // Tela para lançar/editar o resultado.
    @GetMapping("/{id}/resultado")
    public String resultado(@PathVariable Long id, Model model) {
        model.addAttribute("partida", partidaService.buscarPorId(id));
        return "admin/partidas/resultado";
    }

    // Salva o resultado (lancarResultado define os gols, encerra a partida e recalcula os palpites).
    @PostMapping("/{id}/resultado")
    public String salvarResultado(
            @PathVariable Long id,
            @RequestParam Integer golsCasa,
            @RequestParam Integer golsVisitante,
            Model model
    ) {
        try {
            partidaService.lancarResultado(id, golsCasa, golsVisitante);
            return "redirect:/admin/partidas";
        } catch (RuntimeException e) {
            model.addAttribute("erro", e.getMessage());
            model.addAttribute("partida", partidaService.buscarPorId(id));
            return "admin/partidas/resultado";
        }
    }

    // Exclui uma partida (falha se houver palpites — nesse caso volta à lista).
    @PostMapping("/{id}/excluir")
    public String excluir(@PathVariable Long id) {
        try {
            partidaService.excluir(id);
        } catch (RuntimeException e) {
            // não foi possível excluir (ex.: possui palpites) — apenas volta à lista
        }
        return "redirect:/admin/partidas";
    }

    // Monta um objeto Partida a partir dos campos do formulário.
    // As seleções entram apenas com o id (o JPA resolve a referência ao salvar).
    private Partida montarPartida(
            Long selecaoCasaId,
            Long selecaoVisitanteId,
            LocalDateTime dataHora,
            String estadio,
            String fase,
            String grupo
    ) {
        Selecao casa = new Selecao();
        casa.setId(selecaoCasaId);

        Selecao visitante = new Selecao();
        visitante.setId(selecaoVisitanteId);

        return Partida.builder()
                .selecaoCasa(casa)
                .selecaoVisitante(visitante)
                .dataHora(dataHora)
                .estadio(estadio)
                .fase(fase)
                .grupo(grupo)
                .build();
    }
}

package com.example.gestor_inversores.service.earning;

import com.example.gestor_inversores.dto.ResponseEarningDTO;
import com.example.gestor_inversores.exception.*;
import com.example.gestor_inversores.mapper.EarningMapper;
import com.example.gestor_inversores.model.*;
import com.example.gestor_inversores.model.enums.EarningStatus;
import com.example.gestor_inversores.repository.IEarningRepository;
import com.example.gestor_inversores.repository.IInvestorRepository;
import com.example.gestor_inversores.repository.IProjectRepository;
import com.example.gestor_inversores.repository.IStudentRepository;
import com.example.gestor_inversores.service.mail.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EarningService implements IEarningService {

    private final IEarningRepository earningRepository;
    private final EarningMapper earningMapper;
    private final IProjectRepository projectRepository;
    private final IStudentRepository studentRepository;
    private final IInvestorRepository investorRepository;
    private final MailService mailService;

    public ResponseEarningDTO createFromContract(Contract contract, Student generatedByStudent) {
        if (contract == null) throw new IllegalArgumentException("Contract cannot be null");
        Project project = contract.getProject();
        if (project == null) throw new IllegalStateException("Contract has no project");

        // Determinar duración del proyecto en años
        LocalDate start = project.getStartDate();
        LocalDate end = project.getEndDate() != null ? project.getEndDate() : project.getEstimatedEndDate();
        if (start == null || end == null) {
            start = contract.getCreatedAt();
            end = LocalDate.now();
        }
        long days = ChronoUnit.DAYS.between(start, end);
        double years = days / 365.0;

        // Seleccionar profitRate según duración
        BigDecimal profitRate = contract.getProfit1Year() != null ? contract.getProfit1Year() : BigDecimal.ZERO;
        if (years <= 1.0) profitRate = contract.getProfit1Year();
        else if (years <= 2.0) profitRate = contract.getProfit2Years();
        else profitRate = contract.getProfit3Years();

        if (profitRate == null) profitRate = BigDecimal.ZERO;

        // 🔹 Convertir porcentaje a fracción si es mayor a 1
        if (profitRate.compareTo(BigDecimal.ONE) > 0) {
            profitRate = profitRate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        }

        // 🔹 Limitar a 4 decimales
        profitRate = profitRate.setScale(4, RoundingMode.HALF_UP);

        BigDecimal baseAmount = contract.getAmount();
        BigDecimal profitAmount = baseAmount.multiply(profitRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = baseAmount.add(profitAmount);

        Earning e = new Earning();
        e.setAmount(totalAmount);
        e.setBaseAmount(baseAmount);
        e.setProfitRate(profitRate);
        e.setProfitAmount(profitAmount);
        e.setCurrency(contract.getCurrency());
        e.setStatus(EarningStatus.IN_PROGRESS);
        e.setCreatedAt(LocalDate.now());
        e.setProject(project);
        e.setGeneratedBy(generatedByStudent);
        e.setContract(contract);

        Earning saved = earningRepository.save(e);
        return earningMapper.toResponse(saved);
    }

    @Override
    public ResponseEarningDTO confirmReceipt(Long earningId, Long investorId) {
        Earning earning = earningRepository.findById(earningId)
                .orElseThrow(() -> new EarningNotFoundException("Ganancia no encontrada"));

        Investor investor = investorRepository.findById(investorId)
                .orElseThrow(() -> new InvestorNotFoundException("Inversor no encontrado"));

        // 🛡️ VALIDACIÓN DE SEGURIDAD: Asegurarse de que el inversor es el dueño de la ganancia
        Long earningOwnerId = earning.getContract().getCreatedByInvestor().getId();
        if (!earningOwnerId.equals(investor.getId())) {
            throw new UnauthorizedOperationException("No tienes permiso para gestionar esta ganancia.");
        }

        if (earning.getStatus() == EarningStatus.RECEIVED) {
            throw new BusinessException("Esta ganancia ya fue confirmada como recibida.");
        }

        earning.setStatus(EarningStatus.RECEIVED);
        earning.setConfirmedBy(investor);
        earning.setConfirmedAt(LocalDate.now());

        // Descontar la inversión inicial del presupuesto del proyecto
        Project project = projectRepository.findById(earning.getProject().getIdProject())
                .orElseThrow(() -> new BusinessException("La ganancia no está asociada a un proyecto válido"));

        BigDecimal currentGoal = project.getCurrentGoal() != null ? project.getCurrentGoal() : BigDecimal.ZERO;
        BigDecimal amountToSubtract = earning.getBaseAmount() != null ? earning.getBaseAmount() : BigDecimal.ZERO;

        if (currentGoal.compareTo(amountToSubtract) < 0) {
            throw new BusinessException("El proyecto no tiene fondos suficientes para pagar esta ganancia");
        }

        project.setCurrentGoal(currentGoal.subtract(amountToSubtract));
        projectRepository.save(project);

        return earningMapper.toResponse(earningRepository.save(earning));
    }

    @Override
    public ResponseEarningDTO markAsNotReceived(Long earningId, Long investorId) {
        Earning earning = earningRepository.findById(earningId)
                .orElseThrow(() -> new EarningNotFoundException("Ganancia no encontrada"));

        Investor investor = investorRepository.findById(investorId)
                .orElseThrow(() -> new InvestorNotFoundException("Inversor no encontrado"));

        // 🛡️ VALIDACIÓN DE SEGURIDAD: Asegurarse de que el inversor es el dueño de la ganancia
        Long earningOwnerId = earning.getContract().getCreatedByInvestor().getId();
        if (!earningOwnerId.equals(investor.getId())) {
            throw new UnauthorizedOperationException("No tienes permiso para gestionar esta ganancia.");
        }

        if (earning.getStatus() == EarningStatus.RECEIVED) {
            throw new BusinessException("No se puede marcar como 'no recibida' una ganancia que ya fue confirmada.");
        }

        earning.setStatus(EarningStatus.NOT_RECEIVED);
        earning.setConfirmedBy(investor);
        earning.setConfirmedAt(LocalDate.now());

        // Enviar email de alerta al dueño del proyecto
        Project project = earning.getProject();
        if (project.getOwner() != null && project.getOwner().getEmail() != null && !project.getOwner().getEmail().isBlank()) {
            String subject = "Alerta: Ganancia no recibida";
            String body = "El inversor " + investor.getUsername() +
                    " reportó que no recibió la ganancia del contrato " + earning.getContract().getIdContract() +
                    " del proyecto " + project.getName() + ". Por favor, comuníquese con el inversor para resolverlo.";
            mailService.sendEmail(project.getOwner().getEmail(), subject, body);
        }

        return earningMapper.toResponse(earningRepository.save(earning));
    }

    @Override
    public List<ResponseEarningDTO> getByProject(Long projectId) {
        return earningRepository.findByProject_IdProject(projectId)
                .stream()
                .map(earningMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResponseEarningDTO> getByInvestor(Long investorId) {
        return earningRepository.findByConfirmedBy_Id(investorId)
                .stream()
                .map(earningMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResponseEarningDTO> getByStudent(Long studentId) {
        return earningRepository.findByGeneratedBy_Id(studentId)
                .stream()
                .map(earningMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResponseEarningDTO> getAll() {
        return earningRepository.findAll()
                .stream()
                .map(earningMapper::toResponse)
                .collect(Collectors.toList());
    }
}

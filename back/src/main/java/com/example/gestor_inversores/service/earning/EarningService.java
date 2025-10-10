package com.example.gestor_inversores.service.earning;

import com.example.gestor_inversores.dto.ResponseEarningDTO;
import com.example.gestor_inversores.exception.BusinessException;
import com.example.gestor_inversores.exception.EarningNotFoundException;
import com.example.gestor_inversores.exception.InvestorNotFoundException;
import com.example.gestor_inversores.mapper.EarningMapper;
import com.example.gestor_inversores.model.Contract;
import com.example.gestor_inversores.model.Earning;
import com.example.gestor_inversores.model.Investor;
import com.example.gestor_inversores.model.Project;
import com.example.gestor_inversores.model.Student;
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

    @Override
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
    public ResponseEarningDTO createManual(Long generatedByStudentId, Long contractId, BigDecimal amount, com.example.gestor_inversores.model.enums.Currency currency) {
        Student student = studentRepository.findById(generatedByStudentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Project project = null;
        if (contractId != null) {
            // intentar enlazar proyecto desde contrato
            // si necesitás inyectar IContractRepository hacelo; por simplicidad, busco por contract.getProject() desde la entidad que me pasen
        }

        Earning e = new Earning();
        e.setAmount(amount);
        e.setCurrency(currency);
        e.setStatus(EarningStatus.IN_PROGRESS);
        e.setCreatedAt(LocalDate.now());
        e.setGeneratedBy(student);
        e.setProject(project);

        Earning saved = earningRepository.save(e);
        return earningMapper.toResponse(saved);
    }

    @Transactional
    @Override
    public ResponseEarningDTO confirmEarning(Long earningId, Long investorId, EarningStatus status) {

        // 🔹 Buscar la ganancia
        Earning earning = earningRepository.findById(earningId)
                .orElseThrow(() -> new EarningNotFoundException("Earning not found"));

        // 🔹 Buscar inversor
        Investor investor = investorRepository.findById(investorId)
                .orElseThrow(() -> new InvestorNotFoundException("Investor not found"));

        // 🔹 Bloquear cambios si ya fue confirmada como RECEIVED
        if (earning.getStatus() == EarningStatus.RECEIVED) {
            throw new BusinessException("This earning was already confirmed as received. Status cannot be changed.");
        }

        // 🔹 Aplicar el estado recibido por parámetro (por defecto RECEIVED si viene null)
        if (status == null) status = EarningStatus.RECEIVED;
        earning.setStatus(status);
        earning.setConfirmedAt(LocalDate.now());
        earning.setConfirmedBy(investor);

        // 🔹 Recargar proyecto desde DB
        Project project = projectRepository.findById(earning.getProject().getIdProject())
                .orElseThrow(() -> new BusinessException("The earning is not linked to a valid project"));

        // 🔹 Solo descontar si fue RECEIVED
        if (status == EarningStatus.RECEIVED) {
            BigDecimal currentGoal = project.getCurrentGoal() != null ? project.getCurrentGoal() : BigDecimal.ZERO;

            // Descontar solo la inversión inicial (baseAmount)
            BigDecimal amountToSubtract = earning.getBaseAmount() != null ? earning.getBaseAmount() : BigDecimal.ZERO;

            if (currentGoal.compareTo(amountToSubtract) < 0) {
                throw new BusinessException("The project does not have enough funds to pay this earning");
            }

            project.setCurrentGoal(currentGoal.subtract(amountToSubtract));
            projectRepository.save(project);
        }

        // 🔹 NOT_RECEIVED: enviar email al owner (y permite cambiarlo más de una vez)
        else if (status == EarningStatus.NOT_RECEIVED) {
            if (project.getOwner() != null) {
                Student owner = studentRepository.findById(project.getOwner().getId())
                        .orElseThrow(() -> new BusinessException("Project owner not found"));

                if (owner.getEmail() != null && !owner.getEmail().isBlank()) {
                    String subject = "Alerta: Ganancia no recibida";
                    String body = "El inversor " + investor.getUsername() +
                            " reportó que no recibió la ganancia del contrato " + earning.getContract().getIdContract() +
                            " del proyecto " + project.getName() + ". Por favor, comuníquese con el inversor para resolverlo.";

                    mailService.sendEmail(owner.getEmail(), subject, body);
                }
            }
        }

        earningRepository.save(earning);
        return earningMapper.toResponse(earning);
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

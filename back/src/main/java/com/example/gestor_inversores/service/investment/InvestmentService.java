package com.example.gestor_inversores.service.investment;

import com.example.gestor_inversores.dto.*;
import com.example.gestor_inversores.exception.*;
import com.example.gestor_inversores.mapper.InvestmentMapper;
import com.example.gestor_inversores.model.*;
import com.example.gestor_inversores.model.enums.Currency;
import com.example.gestor_inversores.model.enums.InvestmentStatus;
import com.example.gestor_inversores.model.enums.ContractStatus;
import com.example.gestor_inversores.repository.*;
import com.example.gestor_inversores.service.contract.ContractService;
import com.example.gestor_inversores.service.currency.CurrencyConversionService;
import com.example.gestor_inversores.service.mail.IMailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InvestmentService implements IInvestmentService {

    private final IInvestmentRepository investmentRepo;
    private final IProjectRepository projectRepo;
    private final IStudentRepository studentRepo;
    private final IInvestorRepository investorRepo;
    private final InvestmentMapper mapper;
    private final CurrencyConversionService currencyConversionService;
    private final IMailService mailService;
    private final ContractService contractService;

    @Autowired
    public InvestmentService(
            IInvestmentRepository investmentRepo,
            IProjectRepository projectRepo,
            IStudentRepository studentRepo,
            IInvestorRepository investorRepo,
            InvestmentMapper mapper,
            CurrencyConversionService currencyConversionService,
            IMailService mailService,
            @Lazy ContractService contractService
    ) {
        this.investmentRepo = investmentRepo;
        this.projectRepo = projectRepo;
        this.studentRepo = studentRepo;
        this.investorRepo = investorRepo;
        this.mapper = mapper;
        this.currencyConversionService = currencyConversionService;
        this.mailService = mailService;
        this.contractService = contractService;
    }

    @Override
    public ResponseInvestmentDTO cancelByInvestor(Long id) {
        Investment inv = investmentRepo.findByIdInvestmentAndDeletedFalse(id)
                .orElseThrow(() -> new InvestmentNotFoundException("Inversión no encontrada"));

        if (inv.getStatus() != InvestmentStatus.IN_PROGRESS) {
            throw new UpdateException("La inversión no puede ser cancelada en el estado actual: " + inv.getStatus());
        }

        inv.setStatus(InvestmentStatus.CANCELLED);
        inv.setConfirmedAt(LocalDate.now());

        Investment updatedInvestment = investmentRepo.save(inv);

        // ⚡ Auto-cancelar contrato si inversión cancelada
        autoCancelContractIfNeeded(updatedInvestment);

        return mapper.toResponse(updatedInvestment);
    }

    @Override
    public ResponseInvestmentDTO getById(Long id) {
        return investmentRepo.findByIdInvestmentAndDeletedFalse(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new InvestmentNotFoundException("Inversión no encontrada"));
    }

    @Override
    public List<ResponseInvestmentDTO> getAll() {
        return investmentRepo.findByDeletedFalse()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResponseInvestmentDTO> getActiveForStudents() {
        List<InvestmentStatus> allowedStatuses = List.of(
                InvestmentStatus.IN_PROGRESS,
                InvestmentStatus.RECEIVED,
                InvestmentStatus.NOT_RECEIVED
        );
        return investmentRepo.findByDeletedFalseAndStatusIn(allowedStatuses)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResponseInvestmentDTO> getActiveByProjectForStudents(Long projectId) {
        List<InvestmentStatus> allowedStatuses = List.of(
                InvestmentStatus.IN_PROGRESS,
                InvestmentStatus.RECEIVED,
                InvestmentStatus.NOT_RECEIVED
        );
        return investmentRepo.findByProject_IdProjectAndDeletedFalseAndStatusIn(projectId, allowedStatuses)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ResponseInvestmentDTO delete(Long id) {
        Investment inv = investmentRepo.findById(id)
                .orElseThrow(() -> new InvestmentNotFoundException("Inversión no encontrada con ID: " + id));

        // 1. Revertir impacto financiero si ya fue recibida
        if (inv.getStatus() == InvestmentStatus.RECEIVED) {
            Project project = inv.getProject();
            BigDecimal amountInUSD = inv.getAmount();
            if (inv.getCurrency() != Currency.USD) {
                amountInUSD = currencyConversionService
                        .getConversionRate(inv.getCurrency().name(), "USD")
                        .getRate()
                        .multiply(inv.getAmount());
            }
            BigDecimal newCurrentGoal = project.getCurrentGoal().subtract(amountInUSD);
            project.setCurrentGoal(newCurrentGoal.max(BigDecimal.ZERO)); // Evitar negativos
            projectRepo.save(project);
        }

        // 2. Poner la inversión en un estado final y claro
        inv.setStatus(InvestmentStatus.CANCELLED);
        inv.setDeleted(true);
        inv.setDeletedAt(LocalDate.now());

        // 3. Asegurar que el contrato asociado se cancele
        autoCancelContractIfNeeded(inv);

        // 4. Guardar y retornar
        return mapper.toResponse(investmentRepo.save(inv));
    }

    @Override
    public ResponseInvestmentDTO confirmReceipt(Long investmentId, Long studentId) {
        Investment inv = investmentRepo.findByIdInvestmentAndDeletedFalse(investmentId)
                .orElseThrow(() -> new InvestmentNotFoundException("Inversión no encontrada"));

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException("Estudiante no encontrado"));

        // 🛡️ VALIDACIÓN DE SEGURIDAD
        Long projectOwnerId = inv.getProject().getOwner().getId();
        if (!projectOwnerId.equals(student.getId())) {
            throw new UnauthorizedOperationException("No tienes permiso para gestionar esta inversión. Solo el dueño del proyecto puede hacerlo.");
        }

        if (inv.getStatus() != InvestmentStatus.IN_PROGRESS) {
            throw new UpdateException("Esta inversión ya fue procesada y no se puede modificar nuevamente.");
        }

        inv.setStatus(InvestmentStatus.RECEIVED);
        inv.setConfirmedBy(student);
        inv.setConfirmedAt(LocalDate.now());

        // Ajuste del currentGoal
        Project project = inv.getProject();
        BigDecimal amountInUSD = inv.getAmount();
        if (inv.getCurrency() != Currency.USD) {
            amountInUSD = currencyConversionService
                    .getConversionRate(inv.getCurrency().name(), "USD")
                    .getRate()
                    .multiply(inv.getAmount());
        }
        BigDecimal newCurrentGoal = project.getCurrentGoal().add(amountInUSD);

        project.setCurrentGoal(newCurrentGoal);
        projectRepo.save(project);

        Investment savedInvestment = investmentRepo.save(inv);

        // Notificación al inversor
        String toInvestor = savedInvestment.getGeneratedBy().getEmail();
        String subject = String.format("¡Tu inversión para el proyecto '%s' ha sido confirmada!", savedInvestment.getProject().getName());
        String body = String.format(
            "Hola %s,\n\nTe confirmamos que el estudiante %s %s ha recibido tu inversión de %.2f %s para el proyecto '%s'.\n\n" +
            "¡Gracias por tu contribución!\n\n" +
            "Saludos,\nEl equipo de ProyPlus",
            savedInvestment.getGeneratedBy().getUsername(),
            student.getFirstName(),
            student.getLastName(),
            savedInvestment.getAmount(),
            savedInvestment.getCurrency(),
            savedInvestment.getProject().getName()
        );
        mailService.sendEmail(toInvestor, subject, body);

        return mapper.toResponse(savedInvestment);
    }

    @Override
    public ResponseInvestmentDTO markAsNotReceived(Long investmentId, Long studentId) {
        Investment inv = investmentRepo.findByIdInvestmentAndDeletedFalse(investmentId)
                .orElseThrow(() -> new InvestmentNotFoundException("Inversión no encontrada"));

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException("Estudiante no encontrado"));

        // 🛡️ VALIDACIÓN DE SEGURIDAD
        Long projectOwnerId = inv.getProject().getOwner().getId();
        if (!projectOwnerId.equals(student.getId())) {
            throw new UnauthorizedOperationException("No tienes permiso para gestionar esta inversión. Solo el dueño del proyecto puede hacerlo.");
        }

        if (inv.getStatus() != InvestmentStatus.IN_PROGRESS) {
            throw new UpdateException("Esta inversión ya fue procesada y no se puede modificar nuevamente.");
        }

        inv.setStatus(InvestmentStatus.NOT_RECEIVED);
        inv.setConfirmedBy(student);
        inv.setConfirmedAt(LocalDate.now());

        Investment savedInvestment = investmentRepo.save(inv);

        // Auto-cancelar contrato
        autoCancelContractIfNeeded(savedInvestment);

        // Notificación al inversor
        String toInvestor = savedInvestment.getGeneratedBy().getEmail();
        String subject = String.format("Alerta sobre tu inversión para el proyecto '%s'", savedInvestment.getProject().getName());
        String body = String.format(
            "Hola %s,\n\nEl estudiante %s %s ha reportado que NO ha recibido tu inversión de %.2f %s para el proyecto '%s'.\n\n" +
            "El contrato asociado ha sido cancelado automáticamente. Por favor, ponte en contacto con el estudiante para aclarar la situación o contacta a soporte si crees que es un error.\n\n" +
            "Saludos,\nEl equipo de ProyPlus",
            savedInvestment.getGeneratedBy().getUsername(),
            student.getFirstName(),
            student.getLastName(),
            savedInvestment.getAmount(),
            savedInvestment.getCurrency(),
            savedInvestment.getProject().getName()
        );
        mailService.sendEmail(toInvestor, subject, body);

        return mapper.toResponse(savedInvestment);
    }

    public ResponseInvestmentDTO returnInvestment(Long investmentId) {
        Investment inv = investmentRepo.findByIdInvestmentAndDeletedFalse(investmentId)
                .orElseThrow(() -> new InvestmentNotFoundException("Inversión no encontrada"));

        if (inv.getStatus() != InvestmentStatus.RECEIVED) {
            throw new UpdateException("Solo inversiones RECEIVED pueden iniciar el proceso de devolución.");
        }

        inv.setStatus(InvestmentStatus.PENDING_RETURN);
        inv.setConfirmedAt(LocalDate.now()); // La fecha de inicio de la devolución

        return mapper.toResponse(investmentRepo.save(inv));
    }

    @Override
    public ResponseInvestmentDTO confirmRefund(Long investmentId, RequestInvestmentActionByInvestorDTO dto) {
        // 1. Buscar entidades
        Investment inv = investmentRepo.findByIdInvestmentAndDeletedFalse(investmentId)
                .orElseThrow(() -> new InvestmentNotFoundException("Inversión no encontrada"));
        Investor investor = investorRepo.findById(dto.getInvestorId())
                .orElseThrow(() -> new InvestorNotFoundException("Inversor no encontrado"));

        // 2. Validación de Seguridad: Asegurarse de que el inversor es el dueño de la inversión
        if (!inv.getGeneratedBy().getId().equals(investor.getId())) {
            throw new UnauthorizedOperationException("No tienes permiso para confirmar la devolución de esta inversión.");
        }

        // 3. Validación de Estado: Solo se pueden confirmar devoluciones pendientes
        if (inv.getStatus() != InvestmentStatus.PENDING_RETURN) {
            throw new UpdateException("Esta devolución no puede ser confirmada en su estado actual.");
        }

        // 4. Actualizar estado de la inversión
        inv.setStatus(InvestmentStatus.RETURNED);
        inv.setConfirmedAt(LocalDate.now());

        // 5. Lógica Financiera: Descontar el dinero del presupuesto del proyecto
        Project project = inv.getProject();
        BigDecimal amountInUSD = inv.getAmount();
        if (inv.getCurrency() != Currency.USD) {
            amountInUSD = currencyConversionService
                    .getConversionRate(inv.getCurrency().name(), "USD")
                    .getRate()
                    .multiply(inv.getAmount());
        }
        BigDecimal newCurrentGoal = project.getCurrentGoal().subtract(amountInUSD);

        project.setCurrentGoal(newCurrentGoal.max(BigDecimal.ZERO)); // Evitar negativos
        projectRepo.save(project);

        Investment savedInvestment = investmentRepo.save(inv);

        // 6. Notificar al estudiante
        Student student = project.getOwner();
        String toStudent = student.getEmail();
        String subject = String.format("Devolución confirmada para tu proyecto '%s'", project.getName());
        String body = String.format(
            "Hola %s,\n\nTe informamos que el inversor '%s' ha confirmado la recepción de la devolución de %.2f %s para tu proyecto '%s'.\n\n" +
            "El ciclo de inversión y devolución para este contrato ha sido completado exitosamente.\n\n" +
            "Saludos,\nEl equipo de ProyPlus",
            student.getFirstName(),
            investor.getUsername(),
            savedInvestment.getAmount(),
            savedInvestment.getCurrency(),
            project.getName()
        );
        mailService.sendEmail(toStudent, subject, body);

        // 7. Retornar DTO
        return mapper.toResponse(savedInvestment);
    }

    // -------------------
    // 🔹 Método interno para auto-cancelar contrato
    // -------------------
    private void autoCancelContractIfNeeded(Investment inv) {
        if (inv.getContract() != null &&
                (inv.getStatus() == InvestmentStatus.NOT_RECEIVED || inv.getStatus() == InvestmentStatus.CANCELLED)) {

            Contract contract = inv.getContract();

            if (contract.getStatus() == ContractStatus.SIGNED) {
                contract.setStatus(ContractStatus.CANCELLED);

                ContractAction action = ContractAction.builder()
                        .contract(contract)
                        .student(inv.getConfirmedBy()) // puede ser null si no hubo estudiante
                        .status(ContractStatus.CANCELLED)
                        .actionDate(LocalDate.now())
                        .build();

                contract.getActions().add(action);
                contractService.saveContract(contract);
            }
        }
    }
}

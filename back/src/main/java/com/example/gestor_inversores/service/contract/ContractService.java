package com.example.gestor_inversores.service.contract;

import com.example.gestor_inversores.dto.*;
import com.example.gestor_inversores.exception.*;
import com.example.gestor_inversores.mapper.ContractMapper;
import com.example.gestor_inversores.model.*;
import com.example.gestor_inversores.model.enums.ContractStatus;
import com.example.gestor_inversores.model.enums.InvestmentStatus;
import com.example.gestor_inversores.repository.*;
import com.example.gestor_inversores.service.earning.EarningService;
import com.example.gestor_inversores.service.investment.InvestmentService;
import com.example.gestor_inversores.service.mail.IMailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractService implements IContractService {

    private final IContractRepository contractRepository;
    private final IProjectRepository projectRepository;
    private final IInvestorRepository investorRepository;
    private final IStudentRepository studentRepository;
    private final ContractMapper contractMapper;
    private final IInvestmentRepository investmentRepo;
    private final InvestmentService investmentService;
    private final EarningService earningService;
    private final IMailService mailService;

    @Override
    public ResponseContractDTO createContract(RequestContractDTO dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ProjectNotFoundException("Proyecto no encontrado"));

        Investor investor = investorRepository.findById(dto.getCreatedByInvestorId())
                .orElseThrow(() -> new InvestorNotFoundException("Inversor no encontrado"));

        // Normalizar profits a fracción decimal antes de guardar
        BigDecimal profit1 = dto.getProfit1Year() != null && dto.getProfit1Year().compareTo(BigDecimal.ONE) > 0 ? dto.getProfit1Year().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP) : dto.getProfit1Year();
        BigDecimal profit2 = dto.getProfit2Years() != null && dto.getProfit2Years().compareTo(BigDecimal.ONE) > 0 ? dto.getProfit2Years().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP) : dto.getProfit2Years();
        BigDecimal profit3 = dto.getProfit3Years() != null && dto.getProfit3Years().compareTo(BigDecimal.ONE) > 0 ? dto.getProfit3Years().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP) : dto.getProfit3Years();

        Contract contract = Contract.builder()
                .project(project)
                .createdByInvestor(investor)
                .amount(dto.getAmount())
                .currency(dto.getCurrency())
                .status(ContractStatus.PENDING_STUDENT_SIGNATURE)
                .createdAt(LocalDate.now())
                .profit1Year(profit1)
                .profit2Years(profit2)
                .profit3Years(profit3)
                .actions(new ArrayList<>())
                .build();

        Contract savedContract = contractRepository.save(contract);

        // Notificación al estudiante
        String toStudent = project.getOwner().getEmail();
        String subjectToStudent = String.format("¡Nueva oferta de contrato para tu proyecto '%s'!", project.getName());
        String bodyToStudent = String.format(
            "Hola %s,\n\nEl inversor '%s' te ha enviado una nueva oferta de contrato para tu proyecto '%s'.\n\n" +
            "Aquí tienes los detalles de la oferta:\n" +
            "------------------------------------\n" +
            "Monto de la Inversión:   %.2f %s\n\n" +
            "Tasas de Ganancia Ofrecidas:\n" +
            "  - A 1 año:   %.2f%%\n" +
            "  - A 2 años:  %.2f%%\n" +
            "  - A 3 años:  %.2f%%\n" +
            "------------------------------------\n\n" +
            "Puedes revisar todos los detalles y firmar el contrato desde la plataforma para aceptar la inversión.\n\n" +
            "Saludos,\nEl equipo de ProyPlus",
            project.getOwner().getFirstName(),
            investor.getUsername(),
            project.getName(),
            savedContract.getAmount(),
            savedContract.getCurrency(),
            savedContract.getProfit1Year().multiply(BigDecimal.valueOf(100)),
            savedContract.getProfit2Years().multiply(BigDecimal.valueOf(100)),
            savedContract.getProfit3Years().multiply(BigDecimal.valueOf(100))
        );
        mailService.sendEmail(toStudent, subjectToStudent, bodyToStudent);

        return contractMapper.toResponseDTO(savedContract);
    }

    @Override
    public ResponseContractDTO signContract(Long contractId, RequestContractActionByStudentDTO dto) {
        return handleStudentAction(contractId, dto, ContractStatus.SIGNED);
    }

    @Override
    public ResponseContractDTO closeContract(Long contractId, RequestContractActionByStudentDTO dto) {
        return handleStudentAction(contractId, dto, ContractStatus.CLOSED);
    }

    @Override
    public ResponseContractDTO cancelContract(Long contractId, RequestContractActionByStudentDTO dto) {
        return handleStudentAction(contractId, dto, ContractStatus.CANCELLED);
    }

    @Override
    public ResponseContractDTO refundContract(Long contractId, RequestContractActionByStudentDTO dto) {
        return handleStudentAction(contractId, dto, ContractStatus.REFUNDED);
    }

    private ResponseContractDTO handleStudentAction(Long contractId, RequestContractActionByStudentDTO dto, ContractStatus actionStatus) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ContractNotFoundException("Contrato no encontrado"));

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new StudentNotFoundException("Estudiante no encontrado"));

        Long projectOwnerId = contract.getProject().getOwner().getId();
        if (!projectOwnerId.equals(student.getId())) {
            throw new UnauthorizedOperationException("No tienes permiso para gestionar este contrato. Solo el dueño del proyecto puede hacerlo.");
        }

        switch (actionStatus) {
            case SIGNED -> {
                if (contract.getStatus() != ContractStatus.PENDING_STUDENT_SIGNATURE) {
                    throw new ContractCannotBeModifiedException(
                            "Este contrato ya fue firmado, cancelado, cerrado o devuelto y no puede firmarse nuevamente.");
                }
            }
            case CLOSED -> {
                if (contract.getStatus() != ContractStatus.SIGNED) {
                    throw new ContractCannotBeModifiedException("Solo contratos firmados pueden cerrarse.");
                }
            }
            case CANCELLED -> {
                if (contract.getStatus() == ContractStatus.CANCELLED ||
                        contract.getStatus() == ContractStatus.CLOSED ||
                        contract.getStatus() == ContractStatus.REFUNDED) {
                    throw new ContractCannotBeModifiedException("El contrato no puede cancelarse en su estado actual.");
                }
            }
            case REFUNDED -> {
                if (contract.getStatus() != ContractStatus.SIGNED &&
                        contract.getStatus() != ContractStatus.CLOSED) {
                    throw new ContractCannotBeModifiedException("Solo contratos firmados o cerrados pueden devolverse al inversor.");
                }
            }
            default -> {}
        }

        contract.setStatus(actionStatus);

        ContractAction action = ContractAction.builder()
                .contract(contract)
                .student(student)
                .status(actionStatus)
                .actionDate(LocalDate.now())
                .build();
        contract.getActions().add(action);

        Investment inv = contract.getInvestment();

        if (actionStatus == ContractStatus.SIGNED && inv == null) {
            inv = new Investment();
            inv.setAmount(contract.getAmount());
            inv.setCurrency(contract.getCurrency());
            inv.setGeneratedBy(contract.getCreatedByInvestor());
            inv.setProject(contract.getProject());
            inv.setStatus(InvestmentStatus.IN_PROGRESS);
            inv.setCreatedAt(LocalDate.now());
            inv.setContract(contract);
            investmentRepo.save(inv);
            contract.setInvestment(inv);
        }

        if (inv != null) {
            switch (actionStatus) {
                case CANCELLED -> {
                    inv.setStatus(InvestmentStatus.CANCELLED);
                    investmentRepo.save(inv);
                }
                case REFUNDED -> {
                    investmentService.returnInvestment(inv.getIdInvestment());
                }
                case CLOSED -> {
                    contractRepository.save(contract);
                    earningService.createFromContract(contract, student);

                    if (inv.getStatus() == InvestmentStatus.RECEIVED) { 
                        inv.setStatus(InvestmentStatus.COMPLETED);
                        investmentRepo.save(inv);
                    }
                }
                case SIGNED -> {
                    if (inv.getStatus() == InvestmentStatus.IN_PROGRESS) {
                        LocalDate fechaLimite = inv.getCreatedAt().plusDays(30);
                        if (LocalDate.now().isAfter(fechaLimite)) {
                            inv.setStatus(InvestmentStatus.CANCELLED);
                            investmentRepo.save(inv);
                            contract.setStatus(ContractStatus.CANCELLED);
                        }
                    }
                }
                default -> {}
            }
        }

        contractRepository.save(contract);

        if (actionStatus == ContractStatus.SIGNED) {
            String toInvestor = contract.getCreatedByInvestor().getEmail();
            String subjectToInvestor = String.format("¡Tu oferta para el proyecto '%s' ha sido aceptada!", contract.getProject().getName());
            String bodyToInvestor = String.format(
                "Hola %s,\n\n¡Buenas noticias! El estudiante %s %s ha firmado el contrato para el proyecto '%s'.\n\n" +
                "La inversión ya ha sido creada y está esperando a que realices la transferencia.\n\n" +
                "Saludos,\nEl equipo de ProyPlus",
                contract.getCreatedByInvestor().getUsername(),
                student.getFirstName(),
                student.getLastName(),
                contract.getProject().getName()
            );
            mailService.sendEmail(toInvestor, subjectToInvestor, bodyToInvestor);
        } else if (actionStatus == ContractStatus.CANCELLED) {
            String toInvestor = contract.getCreatedByInvestor().getEmail();
            String subject = String.format("Alerta: Contrato para el proyecto '%s' cancelado", contract.getProject().getName());
            String body = String.format(
                "Hola %s,\n\nTe informamos que el contrato para el proyecto '%s' ha sido cancelado por el estudiante %s %s.\n\n" +
                "Si no esperabas esta acción, te recomendamos ponerte en contacto con el estudiante para aclarar la situación.\n\n" +
                "Saludos,\nEl equipo de ProyPlus",
                contract.getCreatedByInvestor().getUsername(),
                contract.getProject().getName(),
                student.getFirstName(),
                student.getLastName()
            );
            mailService.sendEmail(toInvestor, subject, body);
        } else if (actionStatus == ContractStatus.REFUNDED) {
            String toInvestor = contract.getCreatedByInvestor().getEmail();
            String subject = String.format("Inicio de Devolución para el proyecto '%s'", contract.getProject().getName());
            String body = String.format(
                "Hola %s,\n\nTe informamos que el estudiante %s %s ha iniciado el proceso de devolución de tu inversión de %.2f %s para el proyecto '%s'.\n\n" +
                "El estado de tu inversión ahora es 'PENDIENTE DE DEVOLUCIÓN'.\n\n" +
                "Acción Requerida: Una vez que hayas verificado la recepción de los fondos en tu cuenta, por favor, ingresa a la plataforma y confirma la recepción de la devolución para cerrar el ciclo por completo.\n\n" +
                "Saludos,\nEl equipo de ProyPlus",
                contract.getCreatedByInvestor().getUsername(),
                student.getFirstName(),
                student.getLastName(),
                contract.getAmount(),
                contract.getCurrency(),
                contract.getProject().getName()
            );
            mailService.sendEmail(toInvestor, subject, body);
        }

        return contractMapper.toResponseDTO(contract);
    }

    @Override
    public ResponseContractDTO updateContractByInvestor(Long contractId, RequestContractUpdateByInvestorDTO dto) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ContractNotFoundException("Contrato no encontrado"));

        Long contractOwnerId = contract.getCreatedByInvestor().getId();
        if (!contractOwnerId.equals(dto.getInvestorId())) {
            throw new UnauthorizedOperationException("No tienes permiso para modificar este contrato.");
        }

        if (contract.getStatus() != ContractStatus.PENDING_STUDENT_SIGNATURE)
            throw new ContractCannotBeModifiedException("Solo contratos pendientes pueden modificarse.");

        contractMapper.updateContractByInvestor(dto, contract);
        contractRepository.save(contract);
        return contractMapper.toResponseDTO(contract);
    }

    @Override
    public ResponseContractDTO cancelByInvestor(Long contractId, RequestContractActionByInvestorDTO dto) {
        // 1. Buscar entidades
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ContractNotFoundException("Contrato no encontrado"));
        Investor investor = investorRepository.findById(dto.getInvestorId())
                .orElseThrow(() -> new InvestorNotFoundException("Inversor no encontrado"));

        // 2. Validación de Seguridad: Asegurarse de que el inversor es el dueño del contrato
        Long contractOwnerId = contract.getCreatedByInvestor().getId();
        if (!contractOwnerId.equals(investor.getId())) {
            throw new UnauthorizedOperationException("No tienes permiso para cancelar este contrato.");
        }

        // 3. Validación de Estado: Solo se pueden cancelar ofertas pendientes
        if (contract.getStatus() != ContractStatus.PENDING_STUDENT_SIGNATURE) {
            throw new ContractCannotBeModifiedException("Esta oferta de contrato ya no puede ser cancelada porque ya ha sido firmada o procesada.");
        }

        // 4. Actualizar estado
        contract.setStatus(ContractStatus.CANCELLED);

        // 5. Guardar el cambio
        Contract savedContract = contractRepository.save(contract);

        // 6. Notificar al estudiante
        Project project = savedContract.getProject();
        Student student = project.getOwner();

        String toStudent = student.getEmail();
        String subject = String.format("Una oferta para tu proyecto '%s' ha sido retirada", project.getName());
        String body = String.format(
            "Hola %s,\n\nTe informamos que el inversor '%s' ha retirado su oferta de contrato para tu proyecto '%s'.\n\n" +
            "Esta oferta ya no está disponible para ser firmada.\n\n" +
            "Saludos,\nEl equipo de ProyPlus",
            student.getFirstName(),
            investor.getUsername(),
            project.getName()
        );
        mailService.sendEmail(toStudent, subject, body);

        // 7. Retornar DTO
        return contractMapper.toResponseDTO(savedContract);
    }

    @Override
    public List<ResponseContractDTO> getContractsByProject(Long projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException("No se encontró el proyecto"));

        return contractRepository.findByProject_IdProject(projectId)
                .stream()
                .map(contractMapper::toResponseDTO)
                .toList();
    }

    @Override
    public List<ResponseContractDTO> getContractsByInvestor(Long investorId) {
        investorRepository.findById(investorId)
                .orElseThrow(() -> new InvestorNotFoundException("No se encontró el inversor"));

        return contractRepository.findByCreatedByInvestorId(investorId)
                .stream()
                .map(contractMapper::toResponseDTO)
                .toList();
    }

    @Override
    public List<ResponseContractDTO> getContractsByOwner(Long ownerId) {
        // 1. Validar que el estudiante exista
        studentRepository.findById(ownerId)
                .orElseThrow(() -> new StudentNotFoundException("Estudiante con id " + ownerId + " no encontrado."));

        // 2. Validar que el estudiante sea dueño de al menos un proyecto
        if (!projectRepository.existsByOwnerId(ownerId)) {
            throw new UnauthorizedOperationException("El estudiante con id " + ownerId + " no es dueño de ningún proyecto.");
        }

        // 3. Usar el nuevo método del repositorio
        List<Contract> contracts = contractRepository.findByProjectOwnerId(ownerId);

        // 4. Mapear y retornar
        return contracts.stream()
                .map(contractMapper::toResponseDTO)
                .toList();
    }

    public void saveContract(Contract contract) {
        contractRepository.save(contract);
    }

}

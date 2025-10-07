package com.example.gestor_inversores.service.earning;

import com.example.gestor_inversores.dto.ResponseEarningDTO;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    @Override
    public ResponseEarningDTO createFromContract(Contract contract, Student generatedByStudent) {
        if (contract == null) throw new IllegalArgumentException("Contract cannot be null");
        Project project = contract.getProject();
        if (project == null) throw new IllegalStateException("Contract has no project");

        // 1) Determinar duración del proyecto (en días) y convertir a años aproximados
        LocalDate start = project.getStartDate();
        LocalDate end = project.getEndDate() != null ? project.getEndDate() : project.getEstimatedEndDate();
        if (start == null || end == null) {
            start = contract.getCreatedAt();
            end = LocalDate.now();
        }
        long days = java.time.temporal.ChronoUnit.DAYS.between(start, end);
        double years = days / 365.0;

        BigDecimal profitRate = contract.getProfit1Year();
        if (years <= 1.0) profitRate = contract.getProfit1Year();
        else if (years <= 2.0) profitRate = contract.getProfit2Years();
        else profitRate = contract.getProfit3Years();

        if (profitRate == null) profitRate = BigDecimal.ZERO;

        BigDecimal baseAmount = contract.getAmount();
        BigDecimal profitAmount = baseAmount.multiply(profitRate);
        BigDecimal totalAmount = baseAmount.add(profitAmount); // total = inversión + ganancia

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

    @Override
    public ResponseEarningDTO confirmEarning(Long earningId, Long investorId, EarningStatus status) {
        Earning e = earningRepository.findById(earningId)
                .orElseThrow(() -> new RuntimeException("Earning not found"));

        if (status != EarningStatus.RECEIVED && status != EarningStatus.NOT_RECEIVED) {
            throw new IllegalArgumentException("Estado inválido para confirmación");
        }

        Investor inv = investorRepository.findById(investorId)
                .orElseThrow(() -> new RuntimeException("Investor not found"));

        e.setStatus(status);
        e.setConfirmedBy(inv);
        e.setConfirmedAt(LocalDate.now());

        Earning saved = earningRepository.save(e);
        return earningMapper.toResponse(saved);
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

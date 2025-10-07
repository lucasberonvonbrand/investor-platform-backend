package com.example.gestor_inversores.service.earning;

import com.example.gestor_inversores.dto.RequestEarningDTO;
import com.example.gestor_inversores.dto.ResponseEarningDTO;
import com.example.gestor_inversores.exception.ContractNotFoundException;
import com.example.gestor_inversores.exception.EarningNotFoundException;
import com.example.gestor_inversores.mapper.EarningMapper;
import com.example.gestor_inversores.model.Contract;
import com.example.gestor_inversores.model.Earning;
import com.example.gestor_inversores.model.Investor;
import com.example.gestor_inversores.model.Student;
import com.example.gestor_inversores.model.enums.EarningStatus;
import com.example.gestor_inversores.repository.IEarningRepository;
import com.example.gestor_inversores.repository.IContractRepository;
import com.example.gestor_inversores.repository.IStudentRepository;
import com.example.gestor_inversores.repository.IInvestorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EarningService  implements IEarningService {

    private final IEarningRepository earningRepo;
    private final IContractRepository contractRepo;
    private final IStudentRepository studentRepo;
    private final IInvestorRepository investorRepo;
    private final EarningMapper mapper;

    /**
    @Override
    public ResponseEarningDTO createEarning(RequestEarningDTO dto) {
        Contract contract = contractRepo.findById(dto.getContractId())
                .orElseThrow(() -> new ContractNotFoundException("Contrato no encontrado"));

        Student student = studentRepo.findById(dto.getGeneratedById())
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        Earning earning = mapper.toEntity(dto);
        earning.setContract(contract);
        earning.setGeneratedBy(student);
        earning.setProject(contract.getProject());
        earning.setCurrency(contract.getCurrency());
        earning.setAmount(contract.getAmount());

        // Calculamos profit según contrato
        BigDecimal profit = contract.getProfit1Year() != null ? contract.getProfit1Year() : BigDecimal.ZERO;
        earning.setProfitAmount(profit);
        earning.setTotalAmount(earning.getAmount().add(profit));

        earningRepo.save(earning);

        return mapper.toDTO(earning);
    }

    @Override
    public ResponseEarningDTO confirmEarning(Long earningId, boolean received) {
        Earning earning = earningRepo.findById(earningId)
                .orElseThrow(() -> new EarningNotFoundException("Earning no encontrado"));

        earning.setStatus(received ? EarningStatus.RECEIVED : EarningStatus.NOT_RECEIVED);
        earning.setConfirmedAt(LocalDate.now());

        return mapper.toDTO(earning);
    }

    @Override
    public ResponseEarningDTO getById(Long id) {
        return earningRepo.findById(id)
                .map(mapper::toDTO)
                .orElseThrow(() -> new EarningNotFoundException("Earning no encontrado"));
    }

    @Override
    public List<ResponseEarningDTO> getAll() {
        return earningRepo.findAll()
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResponseEarningDTO> getByProject(Long projectId) {
        return earningRepo.findByProject_IdProject(projectId)
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
    **/
}

package com.example.gestor_inversores.service.earning;

import com.example.gestor_inversores.dto.EarningsSummaryDTO;
import com.example.gestor_inversores.dto.ResponseEarningDTO;
import com.example.gestor_inversores.model.Contract;
import com.example.gestor_inversores.model.Student;
import com.example.gestor_inversores.model.enums.EarningStatus;

import java.util.List;

public interface IEarningService {

    ResponseEarningDTO createFromContract(Contract contract, Student generatedByStudent);

    ResponseEarningDTO confirmPaymentSent(Long earningId, Long studentId);

    ResponseEarningDTO confirmReceipt(Long earningId, Long investorId);

    ResponseEarningDTO markAsNotReceived(Long earningId, Long investorId);

    List<ResponseEarningDTO> getByProject(Long projectId);

    List<ResponseEarningDTO> getByInvestor(Long investorId, EarningStatus status);

    List<ResponseEarningDTO> getByStudent(Long studentId);

    List<ResponseEarningDTO> getAll();

    EarningsSummaryDTO getEarningsSummary();

    List<ResponseEarningDTO> getByProjectId(Long projectId);

    List<ResponseEarningDTO> getByContractId(Long contractId);
}

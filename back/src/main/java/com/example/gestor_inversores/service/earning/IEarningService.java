package com.example.gestor_inversores.service.earning;

import com.example.gestor_inversores.dto.ResponseEarningDTO;
import com.example.gestor_inversores.model.Contract;
import com.example.gestor_inversores.model.Student;
import com.example.gestor_inversores.model.enums.EarningStatus;

import java.util.List;

public interface IEarningService {

    // Creación automática desde contrato cerrado
    ResponseEarningDTO createFromContract(Contract contract, Student generatedByStudent);

    // Permitir creación manual (opcional)
    ResponseEarningDTO createManual(Long generatedByStudentId, Long contractId, java.math.BigDecimal amount, com.example.gestor_inversores.model.enums.Currency currency);

    // Confirmar por inversor (RECEIVED / NOT_RECEIVED)
    ResponseEarningDTO confirmEarning(Long earningId, Long investorId, EarningStatus status);

    // Consultas
    List<ResponseEarningDTO> getByProject(Long projectId);
    List<ResponseEarningDTO> getByInvestor(Long investorId);
    List<ResponseEarningDTO> getByStudent(Long studentId);
    List<ResponseEarningDTO> getAll();
}

package com.example.gestor_inversores.service.investment;

import com.example.gestor_inversores.dto.RequestInvestmentActionByInvestorDTO;
import com.example.gestor_inversores.dto.ResponseInvestmentDTO;

import java.util.List;

public interface IInvestmentService {

    ResponseInvestmentDTO cancelByInvestor(Long id);

    ResponseInvestmentDTO getById(Long id);

    List<ResponseInvestmentDTO> getAll();

    // Para estudiantes
    List<ResponseInvestmentDTO> getActiveForStudents();

    // Para estudiantes: solo inversiones activas de un proyecto
    List<ResponseInvestmentDTO> getActiveByProjectForStudents(Long projectId);

    ResponseInvestmentDTO delete(Long id);

    // 💡 Acciones del estudiante
    ResponseInvestmentDTO confirmReceipt(Long investmentId, Long studentId);

    ResponseInvestmentDTO markAsNotReceived(Long investmentId, Long studentId);

    ResponseInvestmentDTO rejectOverfunded(Long investmentId, Long studentId);

    // 💡 Nueva acción del inversor
    ResponseInvestmentDTO confirmRefund(Long investmentId, RequestInvestmentActionByInvestorDTO dto);
}
